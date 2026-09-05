// Town Shopkeepers & Employers Dialogue (Mathias, Martha, Lokker, Nina)
window.FFH = window.FFH || {};
window.FFH.NPC_DATABASE = window.FFH.NPC_DATABASE || {};

Object.assign(window.FFH.NPC_DATABASE, {
  'NPC_PIZZERIA_OWNER': {
    id: 'NPC_PIZZERIA_OWNER',
    name: 'Pizzeria Owner',
    title: 'Owner, Pizzeria',
    building: 'B_PIZZA',
    avatarColor: '#E63946',
    modelKey: 'NPC_CHAR_B',
    dialogue: (state) => ({ speaker: 'Pizzeria Owner', text: 'We are closed.', options: [] })
  },
  // 1. RITA SCHNEIDER (University Registrar & Student Services),

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

  // 3. MARTHA BECK (Bakery Grandma & District Heart),

  'NPC_MARTHA': {
    id: 'NPC_MARTHA',
    name: 'Martha Beck (Oma)',
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
          speaker: 'Martha Beck (Oma)',
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
              game.sfx.playSfx('register');
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
        speaker: 'Martha Beck (Oma)',
        en: marthaGreeting,
        options: options
      };
    }
  },

  // 4. NINA VOSS (Kruma Dispatch Lead & Fast Hustler),

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

  // 6. NICO (Senior Expat Roommate & Veteran Student),

  'NPC_NINA': {
    id: 'NPC_NINA',
    name: 'Nina Voss',
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
          speaker: 'Nina Voss (Dispatch Lead)',
          en: 'Hey there! I am Nina Voss, head dispatcher here at Kruma Express. We pick groceries from the dark store and race across Lübeck. The work is fast, the sea wind is freezing, but the pay is honest. Are you ready to hop on the saddle?',
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
        speaker: 'Nina Voss',
        en: ninaGreeting,
        options: options
      };
    }
  },

  // 5. HANS LOKKER (Strict Caretaker & Landlord)
});
