// Town Simulation Character Dialogues, Personalities, and Complex Multi-Branching Storylines
window.FFH = window.FFH || {};

window.FFH.NPC_DATABASE = {
  'NPC_PIZZERIA_OWNER': {
    id: 'NPC_PIZZERIA_OWNER',
    name: 'Pizzeria Owner',
    title: 'Owner, Pizzeria',
    building: 'B_PIZZA',
    avatarColor: '#E63946',
    modelKey: 'NPC_CHAR_B',
    dialogue: (state) => ({ speaker: 'Pizzeria Owner', text: 'We are closed.', options: [] })
  },
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

      // First time introduction (Arrived late in the evening - Office closed until morning)
      if (isFirstMeeting) {
        return {
          speaker: 'Rita Schneider (University Registrar)',
          en: '*Packs her briefcase* Guten Abend! Admissions closed at 17:00. Please come back tomorrow morning at 09:00 for your 250€ tuition matriculation.',
          options: [
            {
              label: '🌙 "I will be here tomorrow at 09:00, Frau Schneider."',
              action: (game) => {
                addRitaMemory('introduced_rita');
                addRitaMemory('arrived_late_day1');
                if (game.state.questStep === 1) game.state.questStep = 2;
                game.state.npcRelationships['NPC_RITA'] = Math.min(100, (game.state.npcRelationships['NPC_RITA'] || 50) + 10);
                
                // Advance daylight cycle to atmospheric night!
                if (game.phase && game.phase.updateAtmosphericTime) {
                  game.phase.updateAtmosphericTime(0.85);
                }
                game.ui.spawnFloatingText('🌙 Evening Arrived! Office Closed until tomorrow.', window.innerWidth / 2, window.innerHeight / 2, '#4CC9F0');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'Get some rest in your room tonight. Tomorrow our work begins!',
                  options: [
                    { label: '🌃 "Have a good evening."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "Gute Nacht, Frau Schneider!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '🏛️ "What should I bring tomorrow morning?"',
              action: (game) => {
                addRitaMemory('introduced_rita');
                addRitaMemory('arrived_late_day1');
                if (game.state.questStep === 1) game.state.questStep = 2;
                game.state.npcRelationships['NPC_RITA'] = Math.min(100, (game.state.npcRelationships['NPC_RITA'] || 50) + 15);
                
                // Advance daylight cycle to atmospheric night!
                if (game.phase && game.phase.updateAtmosphericTime) {
                  game.phase.updateAtmosphericTime(0.85);
                }
                game.ui.spawnFloatingText('🌙 Evening Arrived! Office Closed until tomorrow.', window.innerWidth / 2, window.innerHeight / 2, '#4CC9F0');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'Just your admission letter and 250€ tuition. Sleep well tonight.',
                  options: [
                    { label: '🚶 "See you tomorrow morning!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🌙 "Good night, Frau Schneider."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
          en: `You saved ${state.wallet.toFixed(2)}€! Ready to pay your 250€ tuition and get enrolled?`,
          options: [
            {
              label: '🎓 "Yes! Here is the 250.00€ tuition fee."',
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
                  en: '*Stamps paper firmly* Done! You are officially enrolled at Lübeck.',
                  options: [
                    { label: '🎉 "Thank you, Frau Schneider!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏦 "Heading to Sparkasse Bank next."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '⏳ "I need to hold onto my cash for a bit."',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const remaining = Math.max(0, tuitionGoal - state.wallet).toFixed(2);
      const options = [];

      // Emotional Conversation
      options.push({
        label: '❤️ "Why are you so kind to foreign students, Frau Schneider?"',
        action: (game) => {
          game.state.npcRelationships['NPC_RITA'] = Math.min(100, game.state.npcRelationships['NPC_RITA'] + 15);
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            en: 'My daughter studied in Tokyo alone. Every time I help a student, I think of her.',
            options: [
              { label: '🥺 "Thank you for looking out for us."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) },
              { label: '🏃 "Back to work!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      // Practical legal advice
      if (!state.storyFlags.receivedAstaGrant) {
        options.push({
          label: '⚖️ "Is there legal help if immigration questions me?"',
          action: (game) => {
            game.state.storyFlags.receivedAstaGrant = true;
            game.state.disposition = game.state.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
            game.state.disposition.bureaucrat += 25;
            game.state.npcRelationships['NPC_RITA'] = Math.min(100, game.state.npcRelationships['NPC_RITA'] + 20);
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('⚖️ AStA Student Legal Defense Co-Filed!', window.innerWidth / 2, window.innerHeight / 2, '#3A86FF');
            game.ui.updateQuestTracker();

            window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
              en: 'Under §16b, the student union protects you. I have co-signed your defense waiver.',
              options: [
                { label: '📑 "Thank you, this helps a lot."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) },
                { label: '🏃 "See you soon, Frau Schneider."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
          }
        });
      } else {
        options.push({
          label: '🚪 "Have a great day, Frau Schneider!"',
          action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
        });
      }

      // Contextual Memory Callback in Greetings
      let greetingEn = `Welcome back! You have ${state.wallet.toFixed(2)}€. You need ${remaining}€ more for tuition.`;
      
      if (memories.includes('chose_hustler_start')) {
        greetingEn = `*Smiles* Back from a shift? ${state.wallet.toFixed(2)}€ saved so far. ${remaining}€ to go!`;
      } else if (memories.includes('chose_diplomat_start')) {
        greetingEn = `Good to see you again! You have ${state.wallet.toFixed(2)}€ saved.`;
      }
      
      if (state.wallet >= 200 && state.wallet < tuitionGoal) {
        greetingEn = `Look how close you are: ${state.wallet.toFixed(2)}€! Just one more shift!`;
      } else if (state.isMatriculated) {
        greetingEn = `Our official student! Take your certificate to Bürgeramt or Sparkasse next.`;
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
          en: 'Moin! I came from Naples thirty years ago with empty pockets. If you work hard, you always have a friend here. What brings you by?',
          options: [
            {
              label: '🇮🇹 "How did you survive those first cold years in Germany?"',
              action: (game) => {
                addMathiasMemory('introduced_mathias');
                addMathiasMemory('asked_backstory');
                game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, (game.state.npcRelationships['NPC_MATHIAS'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
                  en: 'I washed dishes at night and fixed bike chains by day! Never let the cold weather beat you, kid.',
                  options: [
                    { label: '🔧 "Thanks for the encouragement, Mathias."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) },
                    { label: '🍕 "Can I buy a hot slice to warm up?"', action: (g) => {
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
              label: '🍕 "Just looking for a warm place between courier routes."',
              action: (game) => {
                addMathiasMemory('introduced_mathias');
                game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, (game.state.npcRelationships['NPC_MATHIAS'] || 50) + 10);
                window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
                  en: 'Step near the stone oven. Nothing beats Baltic frostbite like hot pizza.',
                  options: [
                    { label: '🍕 "Thank you, Herr Becker."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚲 "Back to the street."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
          en: 'Hello dear! I am Oma Martha. Come warm up by the oven! You look freezing.',
          options: [
            {
              label: '🥐 "Frau Schneider at the university told me to visit you."',
              action: (game) => {
                addMarthaMemory('introduced_martha');
                addMarthaMemory('mentioned_rita');
                game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, (game.state.npcRelationships['NPC_MARTHA'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                  en: 'Rita is wonderful! As long as my oven burns, you will not go hungry here.',
                  options: [
                    { label: '🥺 "Thank you so much, Oma Martha."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🍞 "Can I look at your fresh bread?"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
              }
            },
            {
              label: '🚲 "I am doing courier shifts to save for tuition."',
              action: (game) => {
                addMarthaMemory('introduced_martha');
                addMarthaMemory('mentioned_courier');
                game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, (game.state.npcRelationships['NPC_MARTHA'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                  en: 'Hard work builds good character! Just remember warm gloves on the bridges.',
                  options: [
                    { label: '🧤 "I will bundle up, thank you!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "Back to my route."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Favor for Caretaker Lokker: Croissant
      if (!state.storyFlags.hasBakeryCroissant && !state.hasApartment) {
        options.push({
          label: '🥐 "Can I buy a fresh butter croissant for Herr Lokker? (2€)"',
          action: (game) => {
            if (game.state.wallet < 2) {
              game.ui.spawnFloatingText('Need 2€ for croissant!', window.innerWidth / 2, window.innerHeight / 2, '#FF6B6B');
              return;
            }
            game.state.wallet = window.FFH.round2(game.state.wallet - 2);
            game.state.storyFlags.hasBakeryCroissant = true;
            addMarthaMemory('bought_croissant_for_lokker');
            game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 15);
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🥐 Fresh Butter Croissant in bag!', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
            
            window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
              en: 'How sweet! Hans Lokker is strict, but warm butter softens him right up.',
              options: [
                { label: '🏃 "I will deliver it to Herr Lokker now."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                { label: '🏠 "Hope this helps with my room lease."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
              ]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
          }
        });
      } else {
        const canBuyBread = state.wallet >= 3;
        options.push({
          label: canBuyBread ? '🍞 "One fresh sourdough loaf, please! (3€)"' : '🚪 "See you soon, Oma Martha!"',
          action: (game) => {
            if (canBuyBread) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 3);
              game.state.freshness = Math.min(100, (game.state.freshness || 100) + 10);
              game.sfx.playSfx('register');
              game.ui.spawnFloatingText('🍞 Sourdough Bread! Freshness +10', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            }
            game.transitionTo('CITY_EXPLORATION');
          }
        });
      }

      // Memory reactive greeting
      let marthaGreeting = 'Hello dear! Fresh bread just came out of the oven.';
      if (memories.includes('saved_helga')) {
        marthaGreeting = 'Our neighborhood angel! Frau Helga is feeling so much better.';
      } else if (memories.includes('bought_croissant_for_lokker')) {
        marthaGreeting = 'Did Hans Lokker smile when he saw my warm croissant?';
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
          en: 'Moin! I am Nina from Kruma Express. Fast deliveries, cold wind, instant pay. Ready for a shift?',
          options: [
            {
              label: '🚴 "Ready for my first standard shift, Nina."',
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
              label: '🔥 "Give me the high-paying VIP Express rush!"',
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

      // First time meeting Lokker: Focus strictly on Mülltrennung (Waste Sorting)
      if (isFirstMeeting) {
        return {
          speaker: 'Herr Hans Lokker (Caretaker)',
          en: '*Clicks pocket watch shut* I am Hans Lokker, caretaker. Rule number one: Mülltrennung! Blue for paper, yellow for plastic, black for rest. Never mix them up!',
          options: [
            {
              label: '🗑️ "Understood, Herr Lokker: Blue, yellow, and black."',
              action: (game) => {
                addLokkerMemory('introduced_lokker');
                addLokkerMemory('learned_muelltrennung');
                game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, (game.state.npcRelationships['NPC_LOKKER'] || 50) + 15);
                if (game.state.questStep === 0) {
                  game.state.questStep = 1;
                  game.ui.updateQuestTracker();
                }

                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: 'Good. Explore the town first, but remember the university closes by evening!',
                  options: [
                    { label: '🚶 "I will explore the town and head to uni!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏠 "Thank you, Herr Lokker."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
              }
            },
            {
              label: '🏠 "What do I need for my student lease?"',
              action: (game) => {
                addLokkerMemory('introduced_lokker');
                addLokkerMemory('asked_about_room');
                game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, (game.state.npcRelationships['NPC_LOKKER'] || 50) + 10);
                if (game.state.questStep === 0) {
                  game.state.questStep = 1;
                  game.ui.updateQuestTracker();
                }

                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: 'A 30€ deposit downpayment. Sort your trash properly and visit the university before dark.',
                  options: [
                    { label: '🚶 "Heading out to explore now!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "I will bring the 30€ deposit soon."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
              ? '🥐 "Here is a warm croissant from Oma Martha and the 30€ deposit."'
              : '🥐 "I brought Oma Martha\'s fresh croissant (Need 30€ deposit)"',
            action: (game) => {
              if (game.state.wallet < 30) {
                window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                  en: 'Smells delicious! But house rules require a 30€ deposit for the signed lease. Come back with the 30€.',
                  options: [
                    { label: '🚲 "I will run some shifts right now."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "Be right back, Herr Lokker."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
              game.ui.spawnFloatingText('🏠 Lease Signed! (-30€, +1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
              game.ui.updateQuestTracker();

              window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
                en: 'Here is your signed tenancy confirmation! Take this to Bürgeramt for your Anmeldung.',
                options: [
                  { label: '📜 "Thank you, Herr Lokker!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                  { label: '🚪 "Have a good day."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
          label: '🏠 "Step into my room (Gear & Vocabulary)"',
          action: (game) => { game.transitionTo('SHOP'); }
        });
        options.push({
          label: '🚪 "Heading out for delivery, Herr Lokker."',
          action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
        });
      }

      // Memory reactive & slightly forgetful humorous greeting
      let lokkerGreeting = 'Good day. Keep the building quiet after 22:00 and sort your bins properly!';
      if (memories.includes('bribed_with_croissant')) {
        lokkerGreeting = '*Nods approvingly* The polite student! Keep Room 4 tidy and respect quiet hours.';
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
    name: 'Nico (Flatmate)',
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

      // First Meeting Introduction (Dropping luggage in WG & Learning Mülltrennung)
      if (isFirstMeeting) {
        return {
          speaker: 'Nico (Flatmate)',
          en: 'Hey! Welcome to Room 4. Put your heavy suitcase down! Here, take some warm coffee.',
          options: [
            {
              label: '☕ "Thanks Nico! Where can I drop my bags?"',
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
                  en: 'Room 4 is right down the hall. Just remember: Lokker is strict about Mülltrennung (Waste Sorting). Blue for paper, yellow for plastic, black for rest.',
                  options: [
                    { 
                      label: '🗑️ "Got it: Blue, yellow, and black."', 
                      action: (g) => {
                        window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
                          en: 'Nice! Go take a stroll and explore Lübeck. Later, head across the bridge to University Admissions before it closes!',
                          options: [
                            { label: '🚶 "Heading out to explore!"', action: (g2) => g2.transitionTo('CITY_EXPLORATION') },
                            { label: '🚪 "See you tonight, Nico."', action: (g2) => g2.transitionTo('CITY_EXPLORATION') }
                          ]
                        };
                        g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
                      }
                    },
                    { 
                      label: '🤝 "Thanks Nico! You saved me from a landlord disaster."', 
                      action: (g) => {
                        window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
                          en: 'Glad to help! Take a walk around the city, then head over to Rita at the university.',
                          options: [
                            { label: '🚶 "Time to explore the town!"', action: (g2) => g2.transitionTo('CITY_EXPLORATION') },
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
              label: '🎒 "What is the most important house rule here?"',
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
                  en: 'Mülltrennung (Waste Sorting). Blue for paper, yellow for plastic, black for rest. Follow that and you will be fine!',
                  options: [
                    { label: '🚶 "I will explore the town and visit the university."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '☕ "Thanks for the coffee, Nico!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
              label: '🏃 "Hello, checking what documents are required?"',
              action: (game) => {
                addVogelMemory('introduced_vogel');
                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: 'You need your national passport and the Wohnungsgeberbestätigung form signed by Hans Lokker.',
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
          en: 'Ticket B-104? I see you have your passport and the landlord confirmation. Shall we register your address?',
          options: [
            {
              label: '📑 "Here are my passport and the signed lease form."',
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
                game.ui.spawnFloatingText('📑 Registration Complete! (+1 Day)', window.innerWidth / 2, window.innerHeight / 2, '#1D3557');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: '*Stamps document firmly* You are officially registered in Lübeck! Take this to Sparkasse Bank.',
                  options: [
                    { label: '🏦 "Thank you, Herr Vogel!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '📜 "Heading to the bank now."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
              }
            },
            {
              label: '🚪 "I will come back shortly."',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const options = [];

      options.push({
        label: '📜 "Why is paperwork so strict in Germany, Herr Vogel?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
            en: 'Standard forms ensure everyone is treated equally. Once stamped, your rights are protected.',
            options: [
              { label: '🏛️ "That makes sense. Thank you."', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL' }) },
              { label: '🚪 "Good day, Herr Vogel."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Herr Vogel!"',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      // Memory reactive greeting
      let statusMsgEn = state.hasAnmeldung ?
        'Your registration is filed. Next, activate your bank account at Sparkasse.' :
        'To register your address, I need the signed lease (Wohnungsgeberbestätigung) from Hans Lokker.';

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
          en: 'Guten Tag! To unfreeze your Sperrkonto account, I need both your matriculation and city registration.',
          options: [
            {
              label: '🏦 "I am gathering those documents right now."',
              action: (game) => {
                addWeberMemory('introduced_weber');
                addWeberMemory('discussed_sperrkonto');
                game.state.npcRelationships['NPC_WEBER'] = Math.min(100, (game.state.npcRelationships['NPC_WEBER'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  en: 'Great. Once Rita and Herr Vogel stamp your papers, I will disburse your 50€ monthly allowance.',
                  options: [
                    { label: '💳 "Understood. Thank you!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏃 "I will get those stamps."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
              }
            },
            {
              label: '💡 "What is the best financial tip for a student courier?"',
              action: (game) => {
                addWeberMemory('introduced_weber');
                addWeberMemory('asked_financial_advice');
                game.state.npcRelationships['NPC_WEBER'] = Math.min(100, (game.state.npcRelationships['NPC_WEBER'] || 50) + 20);
                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  en: 'Reinvest your wages into bike upgrades like the E-Bike and Thermal Bag. They pay for themselves quickly!',
                  options: [
                    { label: '📈 "Practical advice, thank you."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🚲 "Back to work!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
          en: 'You brought both certificates! Ready to activate your checking account and release your 50€ allowance?',
          options: [
            {
              label: '💳 "Yes, please! Activate my account."',
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
                  en: 'Your account is active and 50.00€ is disbursed! You now have all four documents for Dr. Lindemann.',
                  options: [
                    { label: '🏛️ "Heading to immigration now!"', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🎉 "Thank you, Frau Weber!"', action: (g) => g.transitionTo('CITY_EXPLORATION') }
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
        label: '💳 "Any financial advice for a courier?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
            en: 'Invest in bike upgrades! They save stamina and increase your earnings.',
            options: [
              { label: '📈 "Good advice, thanks!"', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER' }) },
              { label: '🚪 "Good day."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
            ]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Frau Weber!"',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let statusMsgEn = state.isSperrkontoUnlocked ? 
        'Your German checking account is active and funded.' :
        'To activate your account, bring your university enrollment and city registration.';

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
          en: 'Guten Tag. To receive your Residence Permit (§16b), you must submit 4 documents before your visa expires: Matriculation, Lease, City Registration, and Bank Account.',
          options: [
            {
              label: '🇩🇪 "I will complete all 4 documents on time, Dr. Lindemann."',
              action: (game) => {
                addLindemannMemory('introduced_lindemann');
                addLindemannMemory('vowed_discipline');
                game.state.npcRelationships['NPC_LINDEMANN'] = Math.min(100, (game.state.npcRelationships['NPC_LINDEMANN'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: 'Good. Punctuality is respected here. Return when your dossier is ready.',
                  options: [
                    { label: '🏃 "I will gather them right away."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
                    { label: '🏛️ "Thank you, Dr. Lindemann."', action: (g) => g.transitionTo('CITY_EXPLORATION') }
                  ]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_LINDEMANN', custom: true });
              }
            },
            {
              label: '🤝 "I arrived with 20€ and am working hard to build a life here."',
              action: (game) => {
                addLindemannMemory('introduced_lindemann');
                addLindemannMemory('mentioned_struggle');
                game.state.npcRelationships['NPC_LINDEMANN'] = Math.min(100, (game.state.npcRelationships['NPC_LINDEMANN'] || 50) + 10);
                window.FFH.NPC_DATABASE['NPC_LINDEMANN'].currentResponse = {
                  en: 'Hard work is respected. Clear your tuition and submit your papers before time runs out.',
                  options: [
                    { label: '🚲 "Back to my shifts."', action: (g) => g.transitionTo('CITY_EXPLORATION') },
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
          en: '*Reviews your complete file* Your dossier is flawless. Matriculation, Lease, City Registration, and Bank Account are all verified. Ready for your official Residence Permit?',
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
