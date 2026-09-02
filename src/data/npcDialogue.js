// Town Simulation Character Dialogues, Personalities, and Complex Multi-Branching Storylines
window.FFH = window.FFH || {};

window.FFH.NPC_DATABASE = {
  // 1. RITA SCHNEIDER (University Registrar & Student Services)
  'NPC_RITA': {
    id: 'NPC_RITA',
    name: 'Rita Schneider',
    title: 'University Registrar',
    building: 'B_UNI',
    greetingAudio: 'guten_tag',
    avatarColor: '#2EC4B6',
    personality: {
      type: 'Bureaucratic & Orderly',
      likes: 'Official stamps, proper paperwork, correct fees.',
      dislikes: 'Late payments, messy registration files.'
    },
    dialogue: (state) => {
      const tuitionGoal = window.FFH.ECONOMY?.TUITION_GOAL || 250;
      const memories = state.npcMemory['NPC_RITA'] || [];
      const isFirstMeeting = !memories.includes('introduced_rita');

      const addRitaMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_RITA', tag, relDelta, state);
      };
      addRitaMemory('met_rita');

      // First time introduction
      if (isFirstMeeting) {
        return {
          speaker: 'Rita Schneider (University Registrar)',
          en: 'Guten Tag! Welcome to the University of Lübeck. I am Rita Schneider, head of student enrollment. I see your provisional admission dossier here. To officially stamp your Immatrikulationsbescheinigung (Enrollment Certificate), we need to clear your 250€ semester tuition fee. How are you situated financially?',
          options: [
            {
              label: '🚴 "Nice to meet you, Frau Schneider. I only have 20€ left, so I must start courier shifts immediately."',
              action: (game) => {
                addRitaMemory('introduced_rita');
                addRitaMemory('chose_hustler_start');
                if (game.state.questStep === 1) game.state.questStep = 2;
                game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
                game.state.disposition.hustler += 20;
                game.state.npcRelationships['NPC_RITA'] += 10;
                game.ui.updateQuestTracker();
                
                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'I admire your work ethic! Kruma Express warehouse on South Street hires student riders with instant daily pay. Ride safely, earn your tuition, and come right back to my desk!',
                  options: [
                    { label: '📦 "Heading to Kruma to check out the courier shifts!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🍕 "I might also ask Mathias at Pizzeria Vesuvio for tips."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '🤝 "Hello Frau Schneider. I just dropped my bags at the WG. What documents do I need to prepare?"',
              action: (game) => {
                addRitaMemory('introduced_rita');
                addRitaMemory('chose_diplomat_start');
                if (game.state.questStep === 1) game.state.questStep = 2;
                game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
                game.state.disposition.diplomat += 20;
                game.state.npcRelationships['NPC_RITA'] += 15;
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'Good, having a roof over your head is step one! Next you will need your signed lease from Herr Lokker, your city registration (Anmeldung) from Herr Vogel at City Hall, and 250€ tuition.',
                  options: [
                    { label: '🥐 "Understood. I will explore the neighborhood and start saving."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏛️ "Thank you Frau Schneider, I will get to work!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            }
          ]
        };
      }

      // Success Enrollment flow
      if (state.wallet >= tuitionGoal && !state.isMatriculated) {
        return {
          speaker: 'Rita Schneider (University Registrar)',
          en: `Look at your balance, you saved up ${state.wallet.toFixed(2)}€! I remember your first nervous day here. Are you ready to pay your 250€ tuition fee so I can stamp your official enrollment certificate?`,
          options: [
            {
              label: '🎓 "Yes, please! Here is the 250.00€ tuition fee."',
              action: (game) => {
                game.state.wallet = window.FFH.round2(game.state.wallet - tuitionGoal);
                game.state.day = (game.state.day || 1) + 1;
                game.state.isMatriculated = true;
                game.state.storyFlags.paidSemesterFee = true;
                game.state.npcRelationships['NPC_RITA'] = 100;
                addRitaMemory('matriculated');
                if (game.ui && game.ui.triggerStampMoment) {
                  game.ui.triggerStampMoment('Immatrikulationsbescheinigung (Enrollment)', '🎓');
                } else {
                  game.sfx.playSfx('success');
                }
                game.ui.spawnFloatingText('🎓 Matriculation Complete! Certificate Granted! (+1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: '*Takes the wooden stamp and presses down firmly* Done! You are officially enrolled at the University of Lübeck. Take this certificate to Sparkasse Bank or Dr. Lindemann at immigration!',
                  options: [
                    { label: '🎉 "Thank you so much, Frau Schneider! This means the world."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏦 "I will head straight to Sparkasse Bank next."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '⏳ "I need to hold onto my cash for bicycle gear right now."',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const remaining = Math.max(0, tuitionGoal - state.wallet).toFixed(2);
      const options = [];

      // Emotional Conversation
      options.push({
        label: '❤️ "Frau Schneider, why are you always so patient with us foreign students?"',
        action: (game) => {
          game.state.npcRelationships['NPC_RITA'] = Math.min(100, game.state.npcRelationships['NPC_RITA'] + 15);
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            en: 'Ten years ago, my daughter moved to Tokyo for her masters. She didn\'t know a soul and called me in tears over city forms. Every time I stamp a student\'s papers here, I feel like I am sending love across the ocean to her.',
            options: [
              { label: '🥺 "Your daughter is lucky to have you. Thank you for caring."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) },
              { label: '🏃 "I will make you proud, Frau Schneider. Back to work!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      // Practical legal advice
      if (!state.storyFlags.receivedAstaGrant) {
        options.push({
          label: '⚖️ "Is there any legal protection if I run into trouble with immigration?"',
          action: (game) => {
            game.state.storyFlags.receivedAstaGrant = true;
            game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
            game.state.disposition.bureaucrat += 25;
            game.state.npcRelationships['NPC_RITA'] = Math.min(100, game.state.npcRelationships['NPC_RITA'] + 20);
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('⚖️ AStA Student Legal Defense Co-Filed!', window.innerWidth / 2, window.innerHeight / 2, '#3A86FF');
            game.ui.updateQuestTracker();

            window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
              en: 'Under §16b of the Residence Act, the student union (AStA) provides free legal representation. Dr. Schmidt and I have co-signed your emergency paperwork. If any audit questions come up, this waiver protects you.',
              options: [
                { label: '📑 "Having legal support gives me huge peace of mind."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) },
                { label: '🏃 "Thank you, Frau Schneider. See you soon!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
          }
        });
      } else {
        options.push({
          label: '🚪 "I should get going. Have a wonderful day!"',
          action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
        });
      }

      // Contextual Memory Callback in Greetings
      let greetingEn = `Welcome back! You currently have ${state.wallet.toFixed(2)}€. You only need ${remaining}€ more to cover tuition. Keep your head up and ride carefully on those wet cobblestones!`;
      
      if (memories.includes('chose_hustler_start')) {
        greetingEn = `*Smiles warmly as she spots your delivery helmet* Back from another Kruma route? You have ${state.wallet.toFixed(2)}€ saved. Only ${remaining}€ left to tuition freedom!`;
      } else if (memories.includes('chose_diplomat_start')) {
        greetingEn = `*Looks up with a kind smile* Good to see you again. Did you get to try Oma Martha's fresh cinnamon rolls yet? You are at ${state.wallet.toFixed(2)}€ toward tuition.`;
      }
      
      if (state.wallet >= 200 && state.wallet < tuitionGoal) {
        greetingEn = `*Smiles warmly as she looks up from her desk* Look at how close you are, ${state.wallet.toFixed(2)}€! Just one or two more courier runs and we can make your enrollment official.`;
      } else if (state.isMatriculated) {
        greetingEn = `*Beams with pride* Our official student! Make sure to take your matriculation certificate over to Herr Vogel at the Bürgeramt or Frau Weber at Sparkasse next.`;
      }

      return {
        speaker: 'Rita Schneider (Registrar)',
        en: greetingEn,
        options: options
      };
    }
  },

  // 2. MATHIAS BECKER (Pizzeria Boss & Traditionalist)
  'NPC_MATHIAS': {
    id: 'NPC_MATHIAS',
    name: 'Herr Mathias Becker',
    title: 'Pizzeria Chef & Bike Tuner',
    building: 'B_PIZZA',
    greetingAudio: 'guten_tag',
    avatarColor: '#E76F51',
    personality: {
      type: 'Hot-Tempered Craftsman with a Golden Heart',
      likes: 'Crispy dough, polite customers, bike mechanics, honest hustle.',
      dislikes: 'Bicycles parked on dining terraces, fast-food delivery apps.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_MATHIAS'] || [];
      const isFirstMeeting = !memories.includes('introduced_mathias');

      const addMathiasMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_MATHIAS', tag, relDelta, state);
      };
      addMathiasMemory('met_mathias');

      // First Meeting Introduction
      if (isFirstMeeting) {
        return {
          speaker: 'Herr Mathias Becker',
          en: 'Moin! I am Mathias Becker. Thirty years ago I arrived from Naples with empty pockets and greasy bike wrenches, and today I bake the crispiest stone-oven pizza in northern Germany. If you respect my terrace and ride hard, you always have a friend here. What brings you by?',
          options: [
            {
              label: '🇮🇹 "Pleased to meet you, Mathias! How did you survive those first cold years in Germany?"',
              action: (game) => {
                addMathiasMemory('introduced_mathias');
                addMathiasMemory('asked_backstory');
                game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, (game.state.npcRelationships['NPC_MATHIAS'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
                  en: 'In 1994, I got off the train in minus ten degrees with no German, fifty Marks, and an old wrench! I washed dishes at night and fixed bike chains during the day. Look at me now, with my own stone oven. Never let this cold weather freeze your spirit, kid.',
                  options: [
                    { label: '🔧 "That gives me real courage, Mathias. Thank you."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) },
                    { label: '🍕 "Can I buy a fresh slice to keep warm?"', action: (g) => {
                      if (g.state.wallet >= 8) {
                        g.state.wallet = window.FFH.round2(g.state.wallet - 8);
                        g.state.freshness = Math.min(100, (g.state.freshness || 100) + 20);
                        g.sfx.playSfx('register');
                        g.ui.spawnFloatingText('🍕 Hot Pizza! Freshness +20', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
                      }
                      g.transitionTo('CITY_EXPLORATION');
                    }}
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
              }
            },
            {
              label: '🍕 "Good day, Herr Becker. Just looking for a warm place between courier routes."',
              action: (game) => {
                addMathiasMemory('introduced_mathias');
                game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, (game.state.npcRelationships['NPC_MATHIAS'] || 50) + 10);
                window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
                  en: 'Fair enough! Step inside near the wood oven. Nothing cures Baltic frostbite like hot tomato sauce and melted mozzarella.',
                  options: [
                    { label: '🤝 "Thank you, Mathias."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚲 "Back to my delivery bike."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Warm Immigrant Story & Mentorship
      options.push({
        label: '🇮🇹 "Mathias, how did you manage when you first arrived here from Italy?"',
        action: (game) => {
          game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 20);
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            en: 'In 1994, I got off the train in minus ten degrees with no German, fifty Marks, and an old wrench! I washed dishes at night and fixed bike chains during the day. Look at me now, with my own stone oven. Never let this cold weather freeze your spirit, kid.',
            options: [
              { label: '🔧 "That gives me real courage, Mathias. Thank you."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) },
              { label: '🍕 "Can I buy a fresh pizza to keep warm?"', action: (g) => {
                if (g.state.wallet >= 8) {
                  g.state.wallet = window.FFH.round2(g.state.wallet - 8);
                  g.state.freshness = Math.min(100, (g.state.freshness || 100) + 20);
                  g.sfx.playSfx('register');
                  g.ui.spawnFloatingText('🍕 Hot Pizza! Freshness +20', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
                }
                g.transitionTo('CITY_EXPLORATION');
              }}
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      // Moral Dilemma: Off-the-books Cash Help vs Buying Food
      if (!state.storyFlags.tookSchwarzarbeit && state.wallet < 100) {
        options.push({
          label: '🤫 "I am running out of time for my tuition... is there any cash work in the kitchen tonight?"',
          action: (game) => {
            game.state.wallet = window.FFH.round2(game.state.wallet + 25);
            game.state.zollRisk = (game.state.zollRisk || 0) + 15;
            game.state.storyFlags.tookSchwarzarbeit = true;
            addMathiasMemory('took_cash_help');
            game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
            game.state.disposition.hustler += 25;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('💶 +25.00€ Cash in hand! (Zoll risk +15%)', window.innerWidth / 2, window.innerHeight / 2, '#F4A261');

            window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
              en: 'Listen to me... Kruma has your tax ID on file, so I cannot register you on the books. But you washed all my dough trays and did four rush runs. Here is 25€ in cash. Put it straight into your tuition envelope and keep your head down.',
              options: [
                { label: '🤝 "Thank you, Mathias. You saved my week."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                { label: '🍕 "I will make sure your sidewalk stays clean."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
          }
        });
      } else {
        const canBuy = state.wallet >= 8;
        options.push({
          label: canBuy ? '🍕 "One fresh stone-oven Margherita to warm up, please! (8€)"' : '🚪 "I should get back on the road. Take care, Mathias!"',
          action: (game) => {
            if (canBuy) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 8);
              game.state.freshness = Math.min(100, (game.state.freshness || 100) + 20);
              game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 15);
              addMathiasMemory('bought_pizza');
              game.sfx.playSfx('register');
              game.ui.spawnFloatingText('🍕 Hot Pizza! Freshness +20 & Mathias +15', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' });
            } else {
              game.transitionTo('CITY_EXPLORATION');
            }
          }
        });
      }

      // Memory reactive greeting
      let mathiasGreeting = 'Moin! Smells like fresh basil and hot olive oil in here. What can I get for you today, young friend?';
      if (memories.includes('took_cash_help')) {
        mathiasGreeting = '*Winks and whispers over the espresso machine* Keep your head down, kid. The dough trays were spotless last night. How is the tuition envelope looking?';
      } else if (memories.includes('bought_pizza')) {
        mathiasGreeting = 'Look at you, fueled by real Italian carbs! Ready to out-pedal any scooter on the street!';
      }

      return {
        speaker: 'Herr Mathias Becker',
        en: mathiasGreeting,
        options: options
      };
    }
  },

  // 3. MARTHA WEBBER (Bakery Grandma & District Heart)
  'NPC_MARTHA': {
    id: 'NPC_MARTHA',
    name: 'Martha Webber (Oma)',
    title: 'Bakery Hansa Owner',
    building: 'B_BAKERY',
    greetingAudio: 'guten_tag',
    avatarColor: '#F4A261',
    personality: {
      type: 'Warm & Grandmotherly',
      likes: 'Politeness, fresh sourdough, warm student stories.',
      dislikes: 'Cold wind, impolite behavior.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_MARTHA'] || [];
      const isFirstMeeting = !memories.includes('introduced_martha');

      const addMarthaMemory = (tag, delta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_MARTHA', tag, delta, state);
      };
      addMarthaMemory('met_martha');

      // First Meeting Introduction
      if (isFirstMeeting) {
        return {
          speaker: 'Martha Webber (Oma)',
          en: 'Oh hello, my dear! I am Martha Webber, but all the students and neighbors call me Oma Martha. My family has been baking Franzbrötchen and sourdough in this alley since 1952. You look shivering from that Baltic chill. Come close to the warm oven!',
          options: [
            {
              label: '🥐 "Pleased to meet you, Oma Martha! Frau Schneider at the university told me to visit you."',
              action: (game) => {
                addMarthaMemory('introduced_martha');
                addMarthaMemory('mentioned_rita');
                game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, (game.state.npcRelationships['NPC_MARTHA'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                  en: '*Beams with delight* Rita is an angel! She always looks out for newcomers. As long as my oven is burning, you will never go hungry in this town, child.',
                  options: [
                    { label: '🥺 "That means so much to me, Oma Martha."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🍞 "Can I look at your fresh bread?"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
              }
            },
            {
              label: '🚲 "Hello Oma Martha. I am working courier shifts to pay for my university tuition."',
              action: (game) => {
                addMarthaMemory('introduced_martha');
                addMarthaMemory('mentioned_courier');
                game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, (game.state.npcRelationships['NPC_MARTHA'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                  en: 'Hard work builds a noble character! Just make sure you wear warm gloves on that bike. The sea wind on the bridges will freeze your fingers before you even notice.',
                  options: [
                    { label: '🧤 "I will bundle up, thank you Oma Martha!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "Back to my delivery route."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Emergency Neighborhood Favor Dilemma: Medicine Run for Character Reference
      if (!state.storyFlags.helpedMarthaEmergency && !state.storyFlags.hasCharacterReference) {
        options.push({
          label: '👵 "Oma Martha, you look worried... is everything alright in the neighborhood?"',
          action: (game) => {
            window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
              en: 'My dear child... Frau Helga next door is 84 and snowed in without her heart prescription from the clinic near Holstentor. Commercial apps refused the trip in this sleet. If you could cycle over and fetch it for her, I will personally write you a sealed Leumundszeugnis (Character Reference) for immigration.',
              options: [
                {
                  label: '🚲 "I am getting on my bike right now. Frau Helga will have her medicine."',
                  action: (g) => {
                    g.state.storyFlags.helpedMarthaEmergency = true;
                    g.state.storyFlags.hasCharacterReference = true;
                    addMarthaMemory('saved_helga');
                    g.state.disposition = g.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
                    g.state.disposition.diplomat += 30;
                    g.state.inventory.push('leumundszeugnis');
                    g.state.npcRelationships['NPC_MARTHA'] = 100;
                    g.sfx.playSfx('success');
                    g.ui.spawnFloatingText('📜 Received Oma Martha\'s Leumundszeugnis (Diplomat +30)!', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
                    g.ui.updateQuestTracker();

                    window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                      en: '*Tears well up in her eyes as she hugs you* Frau Helga has her medicine and her heater is on. Here is your reference letter. When Dr. Lindemann reads this, she will see the pure heart of a true neighbor.',
                      options: [
                        { label: '🥺 "Thank you, Oma Martha. Take care of yourself."', action: (gg) => gg.transitionTo('CITY_EXPLORATION') },
                        { label: '🏃 "I will keep this letter safe for the hearing."', action: (gg) => gg.transitionTo('CITY_EXPLORATION') }
                      ]
                    };
                    g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
                  }
                },
                {
                  label: '⏳ "I am so sorry Oma Martha, but I must rush to finish my tuition shift first."',
                  action: (g) => g.transitionTo('CITY_EXPLORATION')
                }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
          }
        });
      } else {
        // Comforting Conversation
        options.push({
          label: '❤️ "Oma Martha, I get homesick sometimes. How do you always stay so warm and hopeful?"',
          action: (game) => {
            game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 20);
            window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
              en: 'Oh, my dear child... When this city was rebuilt after the war, we had nothing but cold bricks and each other. You are never truly alone here. As long as my oven is warm, you always have a home in Lübeck.',
              options: [
                { label: '🥺 "Your kindness gives me so much strength. Thank you."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) },
                { label: '🍞 "Can I take a warm sourdough loaf with me?"', action: (g) => {
                  if (g.state.wallet >= 3) {
                    g.state.wallet = window.FFH.round2(game.state.wallet - 3);
                    g.state.freshness = Math.min(100, (game.state.freshness || 100) + 10);
                    g.sfx.playSfx('register');
                  }
                  g.transitionTo('CITY_EXPLORATION');
                }}
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
          }
        });
      }

      // Croissant peace offering for Herr Lokker vs Sourdough
      if (!state.storyFlags.hasBakeryCroissant && !state.storyFlags.bribedLokker && state.wallet >= 2) {
        options.push({
          label: '🥐 "Could I buy one of your warm butter croissants for Herr Lokker? (2€)"',
          action: (game) => {
            game.state.wallet = window.FFH.round2(game.state.wallet - 2);
            game.state.storyFlags.hasBakeryCroissant = true;
            game.state.inventory.push('fresh_croissant');
            addMarthaMemory('bought_croissant_for_lokker');
            game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 15);
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🥐 Fresh Butter Croissant packed in your bag!', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
            
            window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
              en: 'How thoughtful of you! Hans Lokker acts so stern about his quiet hours, but buttery pastries melt his defenses in seconds. Bring it over to the WG Dorm!',
              options: [
                { label: '🏃 "I will deliver it to Herr Lokker right away!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                { label: '🏠 "Hopefully this helps secure my room lease."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
          }
        });
      } else {
        const canBuyBread = state.wallet >= 3;
        options.push({
          label: canBuyBread ? '🍞 "One fresh sourdough loaf to keep my energy up, please! (3€)"' : '🚪 "Thank you, Oma Martha! See you soon."',
          action: (game) => {
            if (canBuyBread) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 3);
              game.state.freshness = Math.min(100, (game.state.freshness || 100) + 10);
              g.sfx.playSfx('register');
              game.ui.spawnFloatingText('🍞 Sourdough Bread! Freshness +10', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            }
            game.transitionTo('CITY_EXPLORATION');
          }
        });
      }

      // Memory reactive greeting
      let marthaGreeting = 'Hello, my child! Fresh cinnamon and warm sourdough just came out of the oven. Come in from the cold wind.';
      if (memories.includes('saved_helga')) {
        marthaGreeting = '*Her face lights up with grandmotherly pride* Our neighborhood angel is here! Frau Helga was just telling the mailman how you saved her heart medicine in the sleet.';
      } else if (memories.includes('bought_croissant_for_lokker')) {
        marthaGreeting = '*Chuckles softly* Did Hans Lokker crack a smile when he saw my warm croissant? Even his gruff mustache cannot resist butter pastry!';
      }

      return {
        speaker: 'Martha Webber (Oma)',
        en: marthaGreeting,
        options: options
      };
    }
  },

  // 4. NINA LINDEMANN (Kruma Dispatch Lead & Fast Hustler)
  'NPC_NINA': {
    id: 'NPC_NINA',
    name: 'Nina Lindemann',
    title: 'Kruma Dispatch Lead',
    building: 'B_DARKSTORE',
    greetingAudio: 'guten_tag',
    avatarColor: '#2A9D8F',
    personality: {
      type: 'Pragmatic, Loyal & Street-Smart',
      likes: 'Speedy deliveries, accurate order picking, e-bike upgrades, couriers supporting each other.',
      dislikes: 'Slow pacing, damaged groceries, unfair customer tips.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_NINA'] || [];
      const isFirstMeeting = !memories.includes('introduced_nina');

      const addNinaMemory = (tag, delta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_NINA', tag, delta, state);
      };
      addNinaMemory('met_nina');

      // First time meeting Nina
      if (isFirstMeeting) {
        return {
          speaker: 'Nina Lindemann (Dispatch Lead)',
          en: 'Hey there! I am Nina Lindemann, head dispatcher here at Kruma Express. We pick groceries from the dark store and race across Lübeck. The work is fast, the sea wind is freezing, but the pay is honest. Are you ready to hop on the saddle?',
          options: [
            {
              label: '🚴 "Nice to meet you, Nina! I am ready for my first standard shift."',
              action: (game) => {
                addNinaMemory('introduced_nina');
                addNinaMemory('first_shift_standard');
                game.state.hasJob = true;
                game.state.isVipRush = false;
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('🚴 Standard Shift Started! Ride safely!', window.innerWidth / 2, window.innerHeight / 2, '#2A9D8F');
                game.transitionTo('PICK');
              }
            },
            {
              label: '🔥 "I need tuition fast, Nina. Give me the high-paying VIP Express rush!"',
              action: (game) => {
                addNinaMemory('introduced_nina');
                addNinaMemory('first_shift_vip');
                game.state.hasJob = true;
                game.state.isVipRush = true;
                game.state.npcRelationships['NPC_NINA'] = Math.min(100, (game.state.npcRelationships['NPC_NINA'] || 50) + 15);
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('🔥 VIP Express Rush! 2.5x Tips active!', window.innerWidth / 2, window.innerHeight / 2, '#FF006E');
                game.transitionTo('PICK');
              }
            }
          ]
        };
      }

      const options = [
        {
          label: '🚴 "I am ready for a standard delivery shift."',
          action: (game) => {
            game.state.hasJob = true;
            game.state.isVipRush = false;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🚴 Standard Shift Started! Ride safely!', window.innerWidth / 2, window.innerHeight / 2, '#2A9D8F');
            game.transitionTo('PICK');
          }
        },
        {
          label: '🔥 "Give me the VIP Express rush, I need the extra customer tips!"',
          action: (game) => {
            game.state.hasJob = true;
            game.state.isVipRush = true;
            game.state.npcRelationships['NPC_NINA'] = Math.min(100, game.state.npcRelationships['NPC_NINA'] + 15);
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🔥 VIP Express Rush! 2.5x Tips active!', window.innerWidth / 2, window.innerHeight / 2, '#FF006E');
            game.transitionTo('PICK');
          }
        }
      ];

      // Memory reactive greeting
      let ninaGreeting = 'Hey! The orders are piling up on the rack and the street ice is no joke today. Fasten your thermal bag tight. Which route are you taking?';
      if (state.upgrades && state.upgrades.ebike) {
        ninaGreeting = 'Look at that motorized beauty! With that E-Bike motor, you will be flying over the Holstentor bridge in record time. Ready to roll?';
      } else if (memories.includes('first_shift_vip')) {
        ninaGreeting = 'The VIP rush specialist is back! Keep that energy up and those tips will clear your tuition in no time. What are we riding today?';
      }

      return {
        speaker: 'Nina Lindemann',
        en: ninaGreeting,
        options: options
      };
    }
  },

  // 5. HANS LOKKER (Strict Caretaker & Landlord)
  'NPC_LOKKER': {
    id: 'NPC_LOKKER',
    name: 'Herr Hans Lokker',
    title: 'Hausverwalter & Caretaker',
    building: 'B_WG',
    greetingAudio: 'guten_tag',
    avatarColor: '#7209B7',
    personality: {
      type: 'Gruff Exterior, Soft Interior (Slightly Forgetful & Mustache-Obsessed)',
      likes: 'Rule adherence, quiet hours (Ruhezeit) after 22:00, clean stairs, respectful students.',
      dislikes: 'Loud party music at night, dropping trash in the hallway.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_LOKKER'] || [];
      const isFirstMeeting = !memories.includes('introduced_lokker');

      const addLokkerMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_LOKKER', tag, relDelta, state);
      };
      addLokkerMemory('met_lokker');

      // First time meeting Lokker
      if (isFirstMeeting) {
        return {
          speaker: 'Herr Hans Lokker',
          en: '*Pulls out a silver pocket watch and clicks it shut* Exactly ten seconds past the hour. I am Hans Lokker, building caretaker and landlord of this WG dormitory. In this house, three things are absolute: 22:00 Ruhezeit quiet hours, strict recycling, and zero muddy tires in the hallway. What is your business here?',
          options: [
            {
              label: '🏠 "Good day, Herr Lokker. I am a new university student inquiring about a room."',
              action: (game) => {
                addLokkerMemory('introduced_lokker');
                addLokkerMemory('asked_about_room');
                game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, (game.state.npcRelationships['NPC_LOKKER'] || 50) + 10);
                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: 'A student. Standard security deposit is 300€, but for working university riders with discipline, I require a 30€ downpayment. Once paid, I sign your Wohnungsgeberbestätigung for the city registration.',
                  options: [
                    { label: '📝 "Understood, Herr Lokker. Let me check my funds."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) },
                    { label: '🏃 "I will gather the deposit cash right away."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
              }
            },
            {
              label: '⏱️ "Pleased to meet you, Herr Lokker. I promise to always honor the 22:00 quiet hours."',
              action: (game) => {
                addLokkerMemory('introduced_lokker');
                addLokkerMemory('promised_ruhezeit');
                game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, (game.state.npcRelationships['NPC_LOKKER'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: '*Adjusts his glasses with rare mild approval* A young person who respects peace at night. That is rare these days. You will need a 30€ deposit downpayment for the student room lease.',
                  options: [
                    { label: '📝 "Let us look into the lease paperwork."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) },
                    { label: '🏃 "I will return with the deposit shortly."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Kaution Gate: Signing Lease & Getting Wohnungsgeberbestätigung
      if (!state.hasApartment) {
        // Route A: Warm Croissant Gift lowers Kaution to €30 and wins immediate goodwill
        if (state.storyFlags.hasBakeryCroissant && !state.storyFlags.bribedLokker) {
          options.push({
            label: state.wallet >= 30 
              ? '🥐 "Herr Lokker, I brought you a warm croissant from Oma Martha and the 30€ deposit."'
              : '🥐 "Herr Lokker, I brought Oma Martha\'s fresh croissant (Need 30€ deposit)"',
            action: (game) => {
              if (game.state.wallet < 30) {
                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: '*Sniffs the warm pastry* Martha\'s baking is a masterpiece, but house rules require at least a 30.00€ Kaution downpayment before I can hand over the signed lease confirmation. Come back when you have the 30€.',
                  options: [
                    { label: '🚲 "I will run a couple of courier shifts right now."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "I will be back with the money shortly, Herr Lokker."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
                return;
              }

              game.state.wallet = window.FFH.round2(game.state.wallet - 30);
              game.state.day = (game.state.day || 1) + 1;
              game.state.storyFlags.bribedLokker = true;
              game.state.storyFlags.landlordConfirmationSigned = true;
              game.state.hasApartment = true;
              addLokkerMemory('bribed_with_croissant');
              game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
              game.state.disposition.diplomat += 20;
              game.state.npcRelationships['NPC_LOKKER'] = 95;
              if (game.ui && game.ui.triggerStampMoment) {
                game.ui.triggerStampMoment('Wohnungsgeberbestätigung (Lease)', '🏠');
              } else {
                game.sfx.playSfx('success');
              }
              game.ui.spawnFloatingText('🏠 Lease Signed! Landlord Confirmation Granted! (-30€, +1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
              game.ui.updateQuestTracker();

              window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                en: '*Sniffs the butter aroma with genuine delight* ...A warm croissant from Martha AND the 30€ deposit?! You have manners, culture, and discipline. Here is your signed Wohnungsgeberbestätigung for the Bürgeramt!',
                options: [
                  { label: '📜 "Thank you very much, Herr Lokker! I will keep the hallway quiet."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                  { label: '🏛️ "I will take this straight to Herr Vogel at the Bürgeramt."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                ]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
            }
          });
        } else {
          // Route B: Work-ethic plea with 30€ deposit downpayment
          options.push({
            label: state.wallet >= 30
              ? '📝 "Herr Lokker, I have the 30€ deposit ready for the student WG room."'
              : '📝 "Inquire about renting the student WG room (Requires 30€ deposit)"',
            action: (game) => {
              if (game.state.wallet < 30) {
                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: 'Standard security deposit is three hundred euros, but for working students I can accept a 30.00€ downpayment. You only have ' + game.state.wallet.toFixed(2) + '€. Come back when you have the cash.',
                  options: [
                    { label: '🚲 "Understood. I will complete courier shifts first."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "I will be back as soon as I earn it."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
                return;
              }

              game.state.wallet = window.FFH.round2(game.state.wallet - 30);
              game.state.day = (game.state.day || 1) + 1;
              game.state.storyFlags.landlordConfirmationSigned = true;
              game.state.hasApartment = true;
              addLokkerMemory('paid_standard_deposit');
              game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
              game.state.disposition.hustler += 15;
              game.state.npcRelationships['NPC_LOKKER'] = 80;
              if (game.ui && game.ui.triggerStampMoment) {
                game.ui.triggerStampMoment('Wohnungsgeberbestätigung (Lease)', '🏠');
              } else {
                game.sfx.playSfx('success');
              }
              game.ui.spawnFloatingText('🏠 Lease Signed! Landlord Confirmation Granted! (-30€, +1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
              game.ui.updateQuestTracker();

              window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                en: 'Here is your official receipt and signed tenancy confirmation. Take this to the Bürgeramt for your city registration. And remember: quiet hours start at 22:00 sharp!',
                options: [
                  { label: '📜 "Thank you, Herr Lokker. I will head to the Bürgeramt."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                  { label: '🚪 "Understood. Have a good evening."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                ]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
            }
          });
        }

        // Second Choice: Emotional / Dorm room entry
        options.push({
          label: '❤️ "Herr Lokker, why are quiet hours and order so important to you?"',
          action: (game) => {
            game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, game.state.npcRelationships['NPC_LOKKER'] + 20);
            window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
              en: 'My late wife Anna loved the peaceful quiet of dusk. She would read by the window whenever St. Mary\'s church bells rang. When the corridors are clean and quiet, I still feel close to her.',
              options: [
                { label: '🥺 "That is beautiful, Herr Lokker. I promise to keep the building peaceful."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) },
                { label: '🏃 "Thank you for sharing that with me."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
          }
        });
      } else {
        // Already housed: Dorm room entry or conversation
        options.push({
          label: '🏠 "Step into my room (Buy gear, practice vocabulary)"',
          action: (game) => { game.transitionTo('SHOP'); }
        });
        options.push({
          label: '🚪 "Just heading out for my next delivery shift, Herr Lokker."',
          action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
        });
      }

      // Memory reactive & slightly forgetful humorous greeting
      let lokkerGreeting = state.semester === 'WINTER'
        ? 'Good day. It is freezing outside! Keep your radiator on Level 3, wipe slush off your tires, and shock-ventilate (Stoßlüften) twice daily to prevent mold!'
        : 'Good day. Summer heat is here! Keep the heavy entrance door locked, don\'t leave wet river towels in the hallway, and respect the 22:00 Ruhezeit!';
      
      if (memories.includes('bribed_with_croissant')) {
        lokkerGreeting = '*Subtly dusts croissant crumbs off his cardigan and straightens his mustache* Hmph! Have you done your morning Stoßlüften airing? Your room is in order, but remember, the quiet hours begin at 22:00!';
      } else if (state.storyFlags.tookSchwarzarbeit || (state.zollRisk || 0) > 0) {
        lokkerGreeting = '*Sniffs sharply* You smell of wood-smoke, garlic, and pizzeria dough past 22:00 Ruhezeit! Doing late-night shifts with Mathias again? Keep your shoes outside, obey house rules, and don\'t bring the Zoll down on my building!';
      } else if (memories.includes('promised_ruhezeit')) {
        lokkerGreeting = '*Nods with solemn approval* The quiet student. No noise complaints from Room 4 so far. Keep up this discipline and the stairs clean.';
      }

      return {
        speaker: 'Herr Hans Lokker',
        en: lokkerGreeting,
        options: options
      };
    }
  },

  // 6. NICO (Senior Expat Roommate & Veteran Student)
  'NPC_NICO': {
    id: 'NPC_NICO',
    name: 'Nico (Hostel & Dorm Buddy)',
    title: 'Senior International Student',
    building: 'B_HOSTEL',
    greetingAudio: 'guten_tag',
    avatarColor: '#3A86FF',
    personality: {
      type: 'Helpful, Humorous & Pragmatic',
      likes: 'Instant coffee, helping newcomers, survival tips, Pfand bottles.',
      dislikes: 'Bürokratie traps, missing visa deadlines.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_NICO'] || [];
      const isFirstMeeting = !memories.includes('introduced_nico');

      const addNicoMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_NICO', tag, relDelta, state);
      };
      addNicoMemory('met_nico');

      // First Meeting Introduction (Dropping luggage in WG & Learning 3 House Rules)
      if (isFirstMeeting) {
        return {
          speaker: 'Nico (Flatmate & Fellow Student)',
          en: 'Hey! You must be the new roommate moving into Room 4. Put that heavy suitcase down on the rug! I am Nico from Brazil, 3rd semester computer science. You look completely frozen from that Baltic wind. Here, take half a mug of warm instant coffee.',
          options: [
            {
              label: '☕ "Thanks Nico! I just walked from the station. Where can I drop my luggage?"',
              action: (game) => {
                addNicoMemory('introduced_nico');
                addNicoMemory('shared_coffee');
                addNicoMemory('dropped_luggage');
                game.state.npcRelationships['NPC_NICO'] = Math.min(100, (game.state.npcRelationships['NPC_NICO'] || 50) + 20);
                if (game.state.questStep === 0) {
                  game.state.questStep = 1;
                  game.ui.spawnFloatingText('🧳 Luggage Dropped! +1 Quest Step', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                  game.ui.updateQuestTracker();
                }

                window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
                  en: 'Room 4 is right down the hall! Drop your coat on the bed. Before you head to the university for registration, remember our 3 golden house rules: 1) Ruhezeit: strict silence after 22:00. 2) Mülltrennung: sort plastic into yellow and paper into blue. 3) Stoßlüften: open windows wide for 5 minutes twice a day!',
                  options: [
                    { 
                      label: '📝 "Got it: 22:00 quiet hours, sort trash, and shock-ventilate windows."', 
                      action: (g) => {
                        window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
                          en: 'Perfect! Now that your bags are stored and you know the house rules, head across the bridge to the University Campus. Rita Schneider at the admissions office is expecting you to start your enrollment.',
                          options: [
                            { label: '🏛️ "On my way to the university campus to meet Rita!"', action: (g2) => g2.transitionTo('CITY_EXPLORATION') },
                            { label: '🚪 "Thanks Nico, see you tonight!"', action: (g2) => g2.transitionTo('CITY_EXPLORATION') }
                          ]
                        };
                        g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
                      }
                    },
                    { 
                      label: '🤝 "Thanks Nico! You just saved me from a landlord disaster."', 
                      action: (g) => {
                        window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
                          en: 'That is what roommates are for! Go see Rita at the university admissions desk now. She will check your documents and tell you what is needed for your student visa.',
                          options: [
                            { label: '🏛️ "Heading to the university campus now!"', action: (g2) => g2.transitionTo('CITY_EXPLORATION') },
                            { label: '🏃 "Catch you later, Nico!"', action: (g2) => g2.transitionTo('CITY_EXPLORATION') }
                          ]
                        };
                        g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
                      }
                    }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
              }
            },
            {
              label: '🎒 "Pleased to meet you, Nico! What do I need to know about living here?"',
              action: (game) => {
                addNicoMemory('introduced_nico');
                addNicoMemory('asked_house_rules');
                addNicoMemory('dropped_luggage');
                game.state.npcRelationships['NPC_NICO'] = Math.min(100, (game.state.npcRelationships['NPC_NICO'] || 50) + 15);
                if (game.state.questStep === 0) {
                  game.state.questStep = 1;
                  game.ui.spawnFloatingText('🧳 Luggage Dropped! +1 Quest Step', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                  game.ui.updateQuestTracker();
                }

                window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
                  en: 'Set your bags down in Room 4 first! In this WG, Caretaker Lokker has 3 non-negotiables: 1) Ruhezeit: zero loud noise past 22:00. 2) Mülltrennung: separate paper and plastic. 3) Stoßlüften: 5-minute window airing daily. Follow these 3 and you will have peace!',
                  options: [
                    { 
                      label: '🏛️ "Understood! Now I will head to the university to meet Rita."', 
                      action: (g) => g.transitionTo('CITY_EXPLORATION') 
                    },
                    { 
                      label: '☕ "Thanks for the warm coffee and guidance, Nico."', 
                      action: (g) => g.transitionTo('CITY_EXPLORATION') 
                    }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Student Solidarity & Homesickness Conversation
      options.push({
        label: '❤️ "Nico, how do you deal with being so far away from your family?"',
        action: (game) => {
          game.state.npcRelationships['NPC_NICO'] = Math.min(100, game.state.npcRelationships['NPC_NICO'] + 20);
          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            en: 'Every Sunday I call home for two hours. I tell them about the historic brick towers, the freezing wind, and the grumpy neighbors who turn out to be sweet. When you feel alone, remember why you came here. We will make it through together, my friend.',
            options: [
              { label: '🤝 "Thank you, Nico. That really helps."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) },
              { label: '🏃 "Let\'s keep pushing forward."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      // Pfand Bottle Recycling Mini-Action
      options.push({
        label: '🍾 "Let\'s return our empty glass deposit bottles for cash." (+0.75€)',
        action: (game) => {
          game.state.wallet = window.FFH.round2(game.state.wallet + 0.75);
          addNicoMemory('recycled_pfand');
          game.sfx.playSfx('register');
          game.ui.spawnFloatingText('🍾 Pfand bottles returned! +0.75€', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');

          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            en: 'Pfand deposit is the unsung hero of student life in Germany! Three glass bottles equals 75 cents. That buys a pack of oats at the discounter.',
            options: [
              { label: '🪙 "Every single cent counts."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
              { label: '🚲 "Back to my delivery route."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      // Memory reactive greeting
      let nicoGreeting = 'Hey! International students stick together. Don\'t let the German red tape get in your head. What\'s on your mind?';
      if (memories.includes('recycled_pfand')) {
        nicoGreeting = 'Look who it is! Our discounter Pfand champion! Ready to save up another euro or head out on the bike?';
      } else if (memories.includes('shared_coffee')) {
        nicoGreeting = 'Mug is always hot, friend! How is the hostel Wi-Fi treating you today?';
      }

      return {
        speaker: 'Nico (Roommate)',
        en: nicoGreeting,
        options: options
      };
    }
  },

  // 7. HERR VOGEL (Rathaus Bürgeramt Official)
  'NPC_VOGEL': {
    id: 'NPC_VOGEL',
    name: 'Herr Vogel',
    title: 'Bürgeramt Registrar',
    building: 'B_RATHAUS',
    greetingAudio: 'guten_tag',
    avatarColor: '#1D3557',
    personality: {
      type: 'Pedantic Bureaucrat with Secret Passion',
      likes: 'Official forms, landlord signatures, neat folders, Hanseatic architecture.',
      dislikes: 'Missing paperwork, unbooked walk-ins, crumpled certificates.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_VOGEL'] || [];
      const isFirstMeeting = !memories.includes('introduced_vogel');

      const addVogelMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_VOGEL', tag, relDelta, state);
      };
      addVogelMemory('met_vogel');

      // First Meeting Introduction
      if (isFirstMeeting) {
        return {
          speaker: 'Herr Vogel (Bürgeramt Official)',
          en: 'Guten Tag. I am Herr Vogel, municipal clerk at the Lübeck Bürgeramt. Under §17 of the Federal Registration Act (Bundesmeldegesetz), all residents must register their living address within 14 days. Without a signed confirmation from your landlord, no Meldebescheinigung can be issued. Do you have your paperwork ready?',
          options: [
            {
              label: '🏛️ "Good day, Herr Vogel. Pleased to meet you. I am preparing my registration."',
              action: (game) => {
                addVogelMemory('introduced_vogel');
                addVogelMemory('polite_to_vogel');
                game.state.npcRelationships['NPC_VOGEL'] = Math.min(100, (game.state.npcRelationships['NPC_VOGEL'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: 'Excellent. Make sure the landlord\'s signature from Herr Lokker is legible and your passport is valid. Orderliness is the foundation of legal certainty.',
                  options: [
                    { label: '📑 "I will present my documents."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL' }) },
                    { label: '🚪 "I will return once I have everything."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
              }
            },
            {
              label: '🏃 "Hello Herr Vogel. Just checking what documents are required."',
              action: (game) => {
                addVogelMemory('introduced_vogel');
                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: 'You require exactly two things: your national passport and the Wohnungsgeberbestätigung form signed by your landlord, Hans Lokker.',
                  options: [
                    { label: '📜 "Understood. Thank you, Herr Vogel."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏠 "I will find Herr Lokker now."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
              }
            }
          ]
        };
      }

      // Successful Registration Flow
      if (!state.hasAnmeldung && (state.hasApartment || state.storyFlags.landlordConfirmationSigned)) {
        return {
          speaker: 'Herr Vogel (Bürgeramt)',
          en: 'Ticket B-104? Please step forward. I see you have your passport and the landlord confirmation from Herr Lokker. Shall we register your municipal address?',
          options: [
            {
              label: '📑 "Yes, please! Here are my passport and the signed lease form."',
              action: (game) => {
                game.state.hasAnmeldung = true;
                game.state.day = (game.state.day || 1) + 1;
                game.state.inventory.push('meldebescheinigung');
                addVogelMemory('registered_address');
                game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
                game.state.disposition.bureaucrat += 20;
                game.state.npcRelationships['NPC_VOGEL'] = 100;
                if (game.ui && game.ui.triggerStampMoment) {
                  game.ui.triggerStampMoment('Meldebescheinigung (Registration)', '📑');
                } else {
                  game.sfx.playSfx('success');
                }
                game.ui.spawnFloatingText('📑 Registration Complete! Meldebescheinigung Granted! (+1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#1D3557');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: '*Applies the double circular city seal with satisfying force* Impeccable. You are officially registered in Lübeck! Take this certificate to Sparkasse Bank to unfreeze your blocked account.',
                  options: [
                    { label: '🏦 "Thank you, Herr Vogel! I will head to the bank."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '📜 "I appreciate your thoroughness."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
              }
            },
            {
              label: '🚪 "I will come back in a moment."',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const options = [];

      options.push({
        label: '📜 "Herr Vogel, why is paperwork so meticulous in Germany?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
            en: 'Standardized forms ensure equality under the law! A clear stamp prevents arbitrary rulings by officials. Once your paper carries the city seal, your rights are protected against anyone.',
            options: [
              { label: '🏛️ "That makes a lot of sense. Thank you."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL' }) },
              { label: '🚪 "Good day, Herr Vogel."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Herr Vogel!" (Leave)',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      // Memory reactive greeting
      let statusMsgEn = state.hasAnmeldung ?
        'Your registration certificate is in order in Akte B-104. Next, activate your blocked account at Sparkasse Bank.' :
        'Without a signed confirmation (Wohnungsgeberbestätigung) from Hans Lokker, I cannot register your address. Please bring the signed form.';

      if (memories.includes('polite_to_vogel')) {
        statusMsgEn = `*Straightens his desk blotter neatly* Ah, our courteous applicant. ${statusMsgEn}`;
      }

      return {
        speaker: 'Herr Vogel (Bürgeramt)',
        en: statusMsgEn,
        options: options
      };
    }
  },

  // 8. FRAU WEBER (Sparkasse Bank Advisor)
  'NPC_WEBER': {
    id: 'NPC_WEBER',
    name: 'Frau Weber',
    title: 'Sparkasse Bank Advisor',
    building: 'B_BANK',
    greetingAudio: 'guten_tag',
    avatarColor: '#E63946',
    personality: {
      type: 'Hyper-Methodical & Protective',
      likes: 'IBAN numbers, verified identities, financial security for students.',
      dislikes: 'Unverified cash, missing registration forms.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_WEBER'] || [];
      const isFirstMeeting = !memories.includes('introduced_weber');

      const addWeberMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_WEBER', tag, relDelta, state);
      };
      addWeberMemory('met_weber');

      // First Meeting Introduction
      if (isFirstMeeting) {
        return {
          speaker: 'Frau Weber (Sparkasse Advisor)',
          en: 'Guten Tag. I am Frau Weber, senior advisor here at Sparkasse Lübeck. Under German banking compliance regulations, foreign student blocked accounts (Sperrkonto) can only be unlocked once you present both your university matriculation and municipal registration certificate. How may I assist your financial setup today?',
          options: [
            {
              label: '🏦 "Good day Frau Weber. I am organizing my student documents to unlock my funds."',
              action: (game) => {
                addWeberMemory('introduced_weber');
                addWeberMemory('discussed_sperrkonto');
                game.state.npcRelationships['NPC_WEBER'] = Math.min(100, (game.state.npcRelationships['NPC_WEBER'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  en: 'Very good. Once Rita Schneider stamps your matriculation and Herr Vogel registers your address, visit my desk and I will immediately disburse your 50€ monthly allowance.',
                  options: [
                    { label: '💳 "Understood. Thank you, Frau Weber."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "I will gather the certificates now."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
              }
            },
            {
              label: '💡 "Hello Frau Weber! What is the smartest way for a student courier to manage money?"',
              action: (game) => {
                addWeberMemory('introduced_weber');
                addWeberMemory('asked_financial_advice');
                game.state.npcRelationships['NPC_WEBER'] = Math.min(100, (game.state.npcRelationships['NPC_WEBER'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  en: 'Reinvest your early courier earnings into tools that multiply your stamina! An E-Bike conversion or Thermal Bag pays for itself in three shifts through speed bonuses and zero damaged goods.',
                  options: [
                    { label: '📈 "Very practical advice, Frau Weber."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚲 "Back to the delivery bike."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
              }
            }
          ]
        };
      }

      // Unlocking Blocked Bank Account
      if (!state.isSperrkontoUnlocked && state.hasAnmeldung && state.isMatriculated) {
        return {
          speaker: 'Frau Weber (Sparkasse Bank)',
          en: 'Good day! You brought both your university enrollment and city registration certificate. Shall we activate your checking account and unfreeze your monthly allowance?',
          options: [
            {
              label: '💳 "Yes, please! Activate my account and release the first 50€ allowance."',
              action: (game) => {
                game.state.isSperrkontoUnlocked = true;
                game.state.day = (game.state.day || 1) + 1;
                game.state.wallet = window.FFH.round2(game.state.wallet + 50);
                addWeberMemory('unlocked_account');
                game.state.npcRelationships['NPC_WEBER'] = 100;
                if (game.ui && game.ui.triggerStampMoment) {
                  game.ui.triggerStampMoment('Sperrkonto Freigabe (Bank Account)', '💳');
                } else {
                  game.sfx.playSfx('register');
                }
                game.ui.spawnFloatingText('💳 Sperrkonto Activated! +50.00€ credited! (+1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  en: 'Wonderful! Your debit card is active and the first 50.00€ has been disbursed to your balance. All four of your core documents are now complete for your visa hearing with Dr. Lindemann!',
                  options: [
                    { label: '🏛️ "I will head straight to the Ausländerbehörde!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🎉 "Thank you so much, Frau Weber!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
              }
            },
            {
              label: '🚪 "I will return shortly."',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const options = [];

      options.push({
        label: '💳 "Frau Weber, what is the best financial advice for a student courier?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
            en: 'Reinvest your early wages into tools that multiply your stamina! An E-Bike conversion kit or Thermal Bag pays for itself in just three shifts through speed bonuses and zero crushed groceries.',
            options: [
              { label: '📈 "Very sound advice. Thank you!"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER' }) },
              { label: '🚪 "Good day, Frau Weber."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Frau Weber!" (Leave)',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let statusMsgEn = state.isSperrkontoUnlocked ? 
        'Your German checking account is active with regular disbursements.' :
        'To unfreeze your Sperrkonto funds, I need your university enrollment certificate and city registration from the Bürgeramt.';

      if (memories.includes('asked_financial_advice')) {
        statusMsgEn = `*Smiles with professional warmth* Good to see you again. Have you invested in any bicycle upgrades yet? ${statusMsgEn}`;
      }

      return {
        speaker: 'Frau Weber (Sparkasse Bank)',
        en: statusMsgEn,
        options: options
      };
    }
  },

  // 9. FRAU DR. LINDEMANN (Ausländerbehörde Immigration Boss & Climax)
  'NPC_LINDEMANN': {
    id: 'NPC_LINDEMANN',
    name: 'Dr. Lindemann',
    title: 'Immigration Office Director',
    building: 'B_AUSLAENDER',
    greetingAudio: 'guten_tag',
    avatarColor: '#2B2D42',
    personality: {
      type: 'Stern but Deeply Fair Immigration Director',
      likes: 'Complete dossiers, resilient students, hard work, community integration.',
      dislikes: 'Expired visas, missing documents, excuses.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_LINDEMANN'] || [];
      const isFirstMeeting = !memories.includes('introduced_lindemann');

      const addLindemannMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_LINDEMANN', tag, relDelta, state);
      };
      addLindemannMemory('met_lindemann');

      // First time meeting Dr. Lindemann
      if (isFirstMeeting) {
        return {
          speaker: 'Dr. Lindemann (Immigration Director)',
          en: 'Guten Tag. I am Dr. Lindemann, director of the Lübeck Immigration Authority (Ausländerbehörde). You are residing here on a temporary 28-day student entry visa. To convert this into a legal Residence Permit (Aufenthaltstitel §16b), you must submit four verified certificates before your deadline expires: University Matriculation, Housing Lease, City Registration, and an Unfrozen Bank Account. Are you aware of your legal responsibilities?',
          options: [
            {
              label: '🇩🇪 "Yes, Dr. Lindemann. I understand my deadlines and will complete every requirement."',
              action: (game) => {
                addLindemannMemory('introduced_lindemann');
                addLindemannMemory('vowed_discipline');
                game.state.npcRelationships['NPC_LINDEMANN'] = Math.min(100, (game.state.npcRelationships['NPC_LINDEMANN'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: 'Good. Discipline and punctuality are the cornerstones of this republic. Return when your dossier is complete.',
                  options: [
                    { label: '🏃 "I will gather the four documents right away."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏛️ "Thank you for the clarity, Dr. Lindemann."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
              }
            },
            {
              label: '🤝 "Pleased to meet you, Dr. Lindemann. I arrived with 20€ and am working hard to build a life here."',
              action: (game) => {
                addLindemannMemory('introduced_lindemann');
                addLindemannMemory('mentioned_struggle');
                game.state.npcRelationships['NPC_LINDEMANN'] = Math.min(100, (game.state.npcRelationships['NPC_LINDEMANN'] || 50) + 10);
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: 'Hard work is respected here. But the law is clear: clear your tuition and register your residence before time runs out.',
                  options: [
                    { label: '🚲 "Back to my delivery shifts."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚪 "Good day, Dr. Lindemann."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
              }
            }
          ]
        };
      }

      const hasAllDocuments = state.isMatriculated && (state.hasApartment || state.storyFlags.landlordConfirmationSigned) && state.hasAnmeldung && state.isSperrkontoUnlocked;

      if (hasAllDocuments) {
        const hasZollIssue = (state.zollRisk || 0) > 0 || !!state.storyFlags.tookSchwarzarbeit;

        if (hasZollIssue) {
          // Dynamic hearing response based on player's journey
          const options = [];

          if (state.storyFlags.hasCharacterReference) {
            options.push({
              label: '📜 "I submit Oma Martha\'s letter. I did emergency medical runs for an elderly neighbor."',
              action: (game) => {
                game.sfx.playSfx('success');
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: '*Reads Martha\'s letter carefully* Bakery owner Martha Webber writes that you risked your courier shift to bike life-saving heart medicine to an 84-year-old pensioner through Baltic sleet. Administrative rules exist to protect society, and you have proven yourself a protector of our community. The Zoll flag is permanently revoked!',
                  options: [
                    {
                      label: '🎉 "Thank you, Dr. Lindemann. I am ready for the final seal!"',
                      action: (g) => {
                        g.state.hasVisaExtended = true;
                        g.sfx.playSfx('success');
                        g.transitionTo('WIN');
                      }
                    },
                    {
                      label: '🇩🇪 "I will continue to be a good neighbor in Lübeck."',
                      action: (g) => {
                        g.state.hasVisaExtended = true;
                        g.sfx.playSfx('success');
                        g.transitionTo('WIN');
                      }
                    }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
              }
            });
          } else if (state.storyFlags.receivedAstaGrant) {
            options.push({
              label: '⚖️ "I invoke the student hardship defense co-filed with Dr. Schmidt at AStA."',
              action: (game) => {
                game.sfx.playSfx('success');
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: 'Dr. Schmidt\'s legal endorsement is on file. International students in acute financial precarity have statutory defense under §16b of the Residence Act. The irregularity is expunged.',
                  options: [
                    {
                      label: '🎉 "Thank you, Dr. Lindemann. Please stamp my residence permit!"',
                      action: (g) => {
                        g.state.hasVisaExtended = true;
                        g.sfx.playSfx('success');
                        g.transitionTo('WIN');
                      }
                    },
                    {
                      label: '⚖️ "Thank you for upholding the law fairly."',
                      action: (g) => {
                        g.state.hasVisaExtended = true;
                        g.sfx.playSfx('success');
                        g.transitionTo('WIN');
                      }
                    }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
              }
            });
          } else {
            options.push({
              label: '🔥 "I arrived with 20€ and rode freezing cobblestones so I wouldn\'t starve. I took no handouts!"',
              action: (game) => {
                game.sfx.playSfx('success');
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: '*A rare warm smile softens her stern face* Your grit and tenacity are undeniable. Germany was built by immigrants who worked with their hands and refused to surrender. Your tuition is paid in full. I will exercise administrative discretion.',
                  options: [
                    {
                      label: '🎉 "Thank you, Dr. Lindemann! I will make this city proud!"',
                      action: (g) => {
                        g.state.hasVisaExtended = true;
                        g.sfx.playSfx('success');
                        g.transitionTo('WIN');
                      }
                    },
                    {
                      label: '⚡ "Thank you for believing in me."',
                      action: (g) => {
                        g.state.hasVisaExtended = true;
                        g.sfx.playSfx('success');
                        g.transitionTo('WIN');
                      }
                    }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
              }
            });
          }

          options.push({
            label: '🤝 "I have lived with respect, obeyed house rules, and integrated into this community."',
            action: (game) => {
              game.sfx.playSfx('success');
              window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                en: 'Your neighbors speak highly of you. Even strict Hans Lokker noted your respect for quiet hours and recycling. True integration is about character, not just paperwork. Your permit is approved.',
                options: [
                  {
                    label: '🎉 "Thank you so much, Dr. Lindemann!"',
                    action: (g) => {
                      g.state.hasVisaExtended = true;
                      g.sfx.playSfx('success');
                      g.transitionTo('WIN');
                    }
                  },
                  {
                    label: '🎓 "I am honored to study here in Lübeck."',
                    action: (g) => {
                      g.state.hasVisaExtended = true;
                      g.sfx.playSfx('success');
                      g.transitionTo('WIN');
                    }
                  }
                ]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
            }
          });

          return {
            speaker: 'Dr. Lindemann (Immigration Director)',
            en: 'I am reviewing your four documents: Matriculation, Lease, City Registration, and Bank Account are all here. However, my terminal flags an inquiry regarding unregistered kitchen hours exceeding your 20-hour quota. Before I make my ruling, what is your explanation?',
            options: options.slice(0, 2)
          };
        }

        // Spotless legal path
        return {
          speaker: 'Dr. Lindemann (Immigration Director)',
          en: 'Inspecting your completed immigration dossier: University Matriculation? 250€ verified by Rita Schneider. Rental Confirmation? Signed by Hans Lokker. Municipal Registration? Stamped by Herr Vogel. Bank Account? Unfrozen by Frau Weber. You navigated the entire German administrative maze with flawless integrity. Are you ready to receive your permanent Residence Permit?',
          options: [
            {
              label: '🎓 "Yes! I submit my completed dossier for the official Aufenthaltstitel!"',
              action: (game) => {
                game.state.hasVisaExtended = true;
                game.sfx.playSfx('success');
                game.transitionTo('WIN');
              }
            },
            {
              label: '🇩🇪 "Thank you, Dr. Lindemann. It is an honor to be here."',
              action: (game) => {
                game.state.hasVisaExtended = true;
                game.sfx.playSfx('success');
                game.transitionTo('WIN');
              }
            }
          ]
        };
      }

      let missingList = [];
      if (!state.isMatriculated) missingList.push('University Enrollment (Rita at Campus)');
      if (!state.hasApartment && !state.storyFlags.landlordConfirmationSigned) missingList.push('Housing Lease (Hans Lokker at WG)');
      if (!state.hasAnmeldung) missingList.push('City Registration (Herr Vogel at Rathaus)');
      if (!state.isSperrkontoUnlocked) missingList.push('Bank Account (Frau Weber at Sparkasse)');

      return {
        speaker: 'Dr. Lindemann (Immigration Director)',
        en: `Good day. Your 28-day temporary entry visa is counting down. Your dossier is still missing: ${missingList.join(', ')}. Complete all four steps before your deadline expires.`,
        options: [
          {
            label: '🏃 "I will gather the remaining documents right away!"',
            action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
          },
          {
            label: '🚪 "Thank you for the reminder, Dr. Lindemann."',
            action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
          }
        ]
      };
    }
  },

  // 10. KLAUS "DER BLITZ" (Veteran Courier Rival & Speed Mentor)
  'NPC_KLAUS': {
    id: 'NPC_KLAUS',
    name: 'Klaus "Der Blitz"',
    title: 'Veteran Kruma Courier',
    building: 'B_DARKSTORE',
    greetingAudio: 'guten_tag',
    avatarColor: '#FF5400',
    personality: {
      type: 'Competitive Speedster with Deep Respect for Hustle',
      likes: 'Drafting behind buses, shaved corner turns, e-bike battery mods.',
      dislikes: 'Tourists blocking bike lanes, broken chains.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_KLAUS'] || [];
      const isFirstMeeting = !memories.includes('introduced_klaus');

      const addKlausMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_KLAUS', tag, relDelta, state);
      };
      addKlausMemory('met_klaus');

      // First time meeting Klaus
      if (isFirstMeeting) {
        return {
          speaker: 'Klaus "Der Blitz"',
          en: 'Moin! They call me Der Blitz around the dispatch racks because nobody takes the Holstentor corner faster than me. Nina says you are the new courier in town. If you want to survive on these wet cobblestones, you better learn how to drift without snapping your chain!',
          options: [
            {
              label: '⚡ "Pleased to meet you, Klaus! Teach me how you take sharp turns without skidding!"',
              action: (game) => {
                addKlausMemory('introduced_klaus');
                addKlausMemory('learned_drift');
                game.state.skillPoints = (game.state.skillPoints || 0) + 1;
                game.state.npcRelationships['NPC_KLAUS'] = Math.min(100, (game.state.npcRelationships['NPC_KLAUS'] || 50) + 20);
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('⚡ Learned Corner Drift! +1 Skill Point!', window.innerWidth / 2, window.innerHeight / 2, '#FF5400');
                game.ui.updatePersistentHUD(game.state);

                window.FFH.NPC_DATABASE['NPC_KLAUS'].currentResponse = {
                  en: 'Lean your body weight inside the turn, feather the rear brake, and never pedal over wet tram tracks! You have real talent, rookie. Keep this momentum going!',
                  options: [
                    { label: '🚴 "Thanks Klaus! Catch me on the leaderboard!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "Back to my delivery bike."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS', custom: true });
              }
            },
            {
              label: '🚲 "Hey Klaus. I am just pacing myself to keep the groceries safe."',
              action: (game) => {
                addKlausMemory('introduced_klaus');
                addKlausMemory('cautious_style');
                window.FFH.NPC_DATABASE['NPC_KLAUS'].currentResponse = {
                  en: 'Safety keeps the tips intact, fair enough! But when rush hour hits, pure speed is what pays the rent.',
                  options: [
                    { label: '⚡ "Good point. See you on the road!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚪 "Back to the rack."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Rival Speed Challenge
      if (!memories.includes('learned_drift')) {
        options.push({
          label: '⚡ "Klaus, teach me how you take sharp cobblestone turns without skidding!"',
          action: (game) => {
            game.state.skillPoints = (game.state.skillPoints || 0) + 1;
            addKlausMemory('learned_drift');
            game.state.npcRelationships['NPC_KLAUS'] = Math.min(100, game.state.npcRelationships['NPC_KLAUS'] + 20);
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('⚡ Learned Corner Drift! +1 Skill Point!', window.innerWidth / 2, window.innerHeight / 2, '#FF5400');
            game.ui.updatePersistentHUD(game.state);

            window.FFH.NPC_DATABASE['NPC_KLAUS'].currentResponse = {
              en: 'Lean your body weight inside the turn, feather the rear brake, and never pedal over wet tram tracks! You have real talent, rookie. Keep this momentum going!',
              options: [
                { label: '🚴 "Thanks Klaus! Catch me on the leaderboard!"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS' }) },
                { label: '🚪 "Back to the street."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS', custom: true });
          }
        });
      } else {
        options.push({
          label: '🔥 "Why do you and Nina constantly debate route strategies?"',
          action: (game) => {
            window.FFH.NPC_DATABASE['NPC_KLAUS'].currentResponse = {
              en: 'Nina prioritizes perfect item safety and zero customer complaints. I prioritize pure aerodynamic speed! But together, we make Kruma Express the fastest dispatch crew in northern Germany.',
              options: [
                { label: '⚡ "Two sides of the same coin!"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS' }) },
                { label: '🚪 "See you later, Klaus."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS', custom: true });
          }
        });
      }

      options.push({
        label: '🚪 "See you on the road, Klaus!" (Leave)',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let klausGreeting = 'Moin! Every second on the street is cash in your pocket. Upgrade your bike and keep your tires pumped to 4 bar!';
      if (memories.includes('learned_drift')) {
        klausGreeting = 'Look at the corner drift master! Seen you carving up the cobblestones out there. Ready for another run?';
      }

      return {
        speaker: 'Klaus "Der Blitz"',
        en: klausGreeting,
        options: options
      };
    }
  },

  // 11. FRAU DR. ANKE SCHMIDT (AStA Student Union Advocate & Legal Shield)
  'NPC_ANKE': {
    id: 'NPC_ANKE',
    name: 'Dr. Anke Schmidt',
    title: 'AStA Student Legal Counsel',
    building: 'B_UNI',
    greetingAudio: 'guten_tag',
    avatarColor: '#4CC9F0',
    personality: {
      type: 'Tenacious Student Rights Advocate',
      likes: 'Fair student wages, tenant rights, emergency bursaries, defeating red tape.',
      dislikes: 'Illegal rent increases, unfair visa rejections.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_ANKE'] || [];
      const isFirstMeeting = !memories.includes('introduced_anke');

      const addAnkeMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_ANKE', tag, relDelta, state);
      };
      addAnkeMemory('met_anke');

      // First time meeting Dr. Schmidt
      if (isFirstMeeting) {
        return {
          speaker: 'Dr. Anke Schmidt (AStA Legal Aid)',
          en: 'Willkommen! I am Dr. Anke Schmidt, legal counsel at the General Students\' Committee (AStA). We represent all enrolled and prospective international students in matters of tenancy law, labor rights, and residence permits. No student in Lübeck should ever feel defenseless against administrative bureaucracy. How can I protect you today?',
          options: [
            {
              label: '📑 "Pleased to meet you, Dr. Schmidt! I need advice on student rights and emergency defense."',
              action: (game) => {
                addAnkeMemory('introduced_anke');
                addAnkeMemory('consulted_rights');
                game.state.storyFlags.receivedAstaGrant = true;
                game.state.skillPoints = (game.state.skillPoints || 0) + 1;
                game.state.npcRelationships['NPC_ANKE'] = 100;
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('📑 Legal Rights Learned! +1 Skill Point!', window.innerWidth / 2, window.innerHeight / 2, '#4CC9F0');
                game.ui.updatePersistentHUD(game.state);

                window.FFH.NPC_DATABASE['NPC_ANKE'].currentResponse = {
                  en: 'Never let administrative pressure intimidate you! International students have full legal rights under German higher education law. Use your Skill Tree to decode Beamtendeutsch and protect your visa.',
                  options: [
                    { label: '🤝 "Thank you so much, Dr. Schmidt!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "I will remember this protection."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE', custom: true });
              }
            },
            {
              label: '🏠 "Hello Dr. Schmidt. What are my rights as a tenant against strict landlords like Herr Lokker?"',
              action: (game) => {
                addAnkeMemory('introduced_anke');
                addAnkeMemory('asked_tenant_law');
                window.FFH.NPC_DATABASE['NPC_ANKE'].currentResponse = {
                  en: 'Landlords cannot enter your room unannounced, and minor wear-and-tear is covered by law. But honoring quiet hours (Ruhezeit) and keeping common areas tidy prevents 99% of disputes!',
                  options: [
                    { label: '💡 "Very reassuring knowledge, thank you!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚪 "Have a wonderful day."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Emergency Student Hardship Bursary
      if (!state.storyFlags.receivedAstaGrant) {
        options.push({
          label: '📑 "Dr. Schmidt, I need advice on student rights and emergency visa funds!" (+1 Skill Point)',
          action: (game) => {
            game.state.storyFlags.receivedAstaGrant = true;
            game.state.skillPoints = (game.state.skillPoints || 0) + 1;
            addAnkeMemory('consulted_rights');
            game.state.npcRelationships['NPC_ANKE'] = 100;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('📑 Legal Rights Learned! +1 Skill Point!', window.innerWidth / 2, window.innerHeight / 2, '#4CC9F0');
            game.ui.updatePersistentHUD(game.state);

            window.FFH.NPC_DATABASE['NPC_ANKE'].currentResponse = {
              en: 'Never let administrative pressure intimidate you! International students have full legal rights under German higher education law. Use your Skill Tree to decode Beamtendeutsch and protect your visa.',
              options: [
                { label: '🤝 "Thank you so much, Dr. Schmidt!"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE' }) },
                { label: '🚪 "Back to work."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE', custom: true });
          }
        });
      }

      // Tenant Rights Consultation
      options.push({
        label: '🏠 "What are my legal rights against strict landlords like Herr Lokker?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_ANKE'].currentResponse = {
            en: 'Landlords cannot enter your room unannounced, and minor wear-and-tear is covered by law. But honoring quiet hours (Ruhezeit) and keeping common areas tidy prevents 99% of disputes!',
            options: [
              { label: '💡 "Empowering knowledge!"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE' }) },
              { label: '🚪 "Good day, Dr. Schmidt."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE', custom: true });
        }
      });

      if (options.length < 2) {
        options.push({
          label: '🚪 "Goodbye, Dr. Schmidt!" (Leave)',
          action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
        });
      }

      return {
        speaker: 'Dr. Anke Schmidt (AStA Legal Aid)',
        en: 'Welcome to the Student Union! We protect international students from bureaucratic traps and unfair housing practices. How can I advocate for you today?',
        options: options.slice(0, 2)
      };
    }
  },

  'NPC_DELIVERY_CUSTOMER': {
    id: 'NPC_DELIVERY_CUSTOMER',
    name: 'Customer',
    title: 'Resident',
    building: 'B_RESIDENTIAL',
    greetingAudio: 'doorbell_correct',
    avatarColor: '#457B9D',
    personality: {
      type: 'Hungry',
      likes: 'Fast delivery, polite couriers.',
      dislikes: 'Crushed items.'
    },
    dialogue: (state) => {
      const scenario = window.FFH.dialogue.find(d => d.shift === state.currentShift) || window.FFH.dialogue[window.FFH.dialogue.length - 1];
      const audioMap = { 1: 'delivery_1', 2: 'delivery_2', 3: 'delivery_3' };
      
      return {
        speaker: scenario.customer || 'Resident at Doorstep',
        audioKey: audioMap[state.currentShift] || 'delivery_1',
        en: scenario.questionEn,
        options: scenario.choices.map(choice => ({
          label: `💬 "${choice.textEn}"`,
          en: choice.textEn,
          audioKey: choice.audioKey,
          action: (game) => {
            game.state.lastEtiquetteTipDelta = choice.tipDelta;
            
            // Increment cumulative personality disposition heuristics
            if (choice.disposition && game.state.disposition) {
              game.state.disposition[choice.disposition] = (game.state.disposition[choice.disposition] || 0) + 1;
            }

            if (choice.audioKey && game.sfx && game.sfx.playSfx) {
              game.sfx.playSfx(choice.audioKey);
            }
            
            game.ui.spawnFloatingText(choice.correct ? `✨ ${choice.feedbackEn}` : `⚠️ ${choice.feedbackEn}`, window.innerWidth / 2, window.innerHeight / 2, choice.correct ? '#4CAF50' : '#E63946');
            
            game.lastPayout = window.FFH.calculatePayout(game.state);
            game.transitionTo('DEBRIEF_RECEIPT');
          }
        }))
      };
    }
  }
};
