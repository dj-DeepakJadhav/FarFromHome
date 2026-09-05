// Residents, Roommate & Customer Dialogue (Nico, Klaus, Anke, Customer)
window.FFH = window.FFH || {};
window.FFH.NPC_DATABASE = window.FFH.NPC_DATABASE || {};

Object.assign(window.FFH.NPC_DATABASE, {
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

  // 7. HERR VOGEL (Rathaus Bürgeramt Official),

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

  // 11. FRAU DR. ANKE SCHMIDT (AStA Student Union Advocate & Legal Shield),

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
});
