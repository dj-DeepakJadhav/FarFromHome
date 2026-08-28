// Town Simulation Character Dialogues, Personalities, and Behavior Tree Configurations
window.FFH = window.FFH || {};

window.FFH.NPC_DATABASE = {
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
      const relationship = state.npcRelationships['NPC_RITA'] || 50;
      const memories = state.npcMemory['NPC_RITA'] || [];
      const hasSpoken = memories.includes('met_rita');

      // Helper to push memory
      const addRitaMemory = (tag) => {
        if (!memories.includes(tag)) memories.push(tag);
      };

      addRitaMemory('met_rita');

      let greetingText = '';
      if (relationship >= 75) {
        greetingText = 'Ah, my favorite student! Welcome back! ';
      } else if (hasSpoken) {
        greetingText = 'Guten Tag again. Let us check your matriculation status. ';
      } else {
        greetingText = 'Guten Tag! Welcome to the University Registry. ';
      }

      // Quest Step 0: Initial Registry
      if (state.questStep === 0) {
        return {
          speaker: 'Rita Schneider',
          text: greetingText + 'To complete your student visa and enrollment, you must pay the Semesterbeitrag of 250.00€ and register a local address. I suggest checking Kruma Express on the north road for work.',
          options: [
            {
              label: 'Understood. I will find a job and earn the money!',
              action: (game) => {
                game.state.questStep = 1;
                game.state.npcRelationships['NPC_RITA'] += 10; // increase relation
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Quest Updated: Find Work', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                game.transitionTo('CITY_EXPLORATION');
              }
            }
          ]
        };
      }

      // Standard dialogue flow
      let text = greetingText;
      if (state.wallet >= tuitionGoal) {
        text += `Ausgezeichnet! You have accumulated ${state.wallet.toFixed(2)}€! Your tuition is fully paid. Welcome to Lübeck!`;
        return {
          speaker: 'Rita Schneider',
          text: text,
          options: [
            {
              label: '🎓 Complete Enrollment (Win Game!)',
              action: (game) => {
                game.transitionTo('WIN');
              }
            }
          ]
        };
      }

      const remaining = (tuitionGoal - state.wallet).toFixed(2);
      text += `You currently have ${state.wallet.toFixed(2)}€. You need ${remaining}€ more.`;

      const options = [];

      // Chat option
      if (!memories.includes('asked_about_uni')) {
        options.push({
          label: '💬 Ask: "What is this university known for?"',
          action: (game) => {
            addRitaMemory('asked_about_uni');
            game.state.npcRelationships['NPC_RITA'] = Math.min(100, game.state.npcRelationships['NPC_RITA'] + 15);
            game.ui.spawnFloatingText('Relationship +15', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
            
            // Show custom dialogue response
            window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
              text: 'We are world-famous for our medical research and computer science department! Keep studying and working hard, and you will do great.',
              options: [{ label: 'Thank you, Frau Schneider.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
          }
        });
      }

      // Gossip option
      options.push({
        label: '🗣️ Gossip: "What do you think of the other townspeople?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            text: 'Herr Becker at the Pizzeria works extremely hard, but he lacks administrative precision. Oma Martha at the bakery is a saint—she always brings me fresh croissants when I process her bakery license renewals!',
            options: [{ label: 'Interesting! Thanks.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      options.push({
        label: 'Leave Registry',
        action: (game) => {
          game.transitionTo('CITY_EXPLORATION');
        }
      });

      return {
        speaker: 'Rita Schneider',
        text: text,
        options: options
      };
    }
  },

  'NPC_MATHIAS': {
    id: 'NPC_MATHIAS',
    name: 'Herr Mathias Becker',
    title: 'Pizzeria Boss',
    building: 'B_PIZZA',
    greetingAudio: 'guten_tag',
    avatarColor: '#E76F51',
    personality: {
      type: 'Grumpy & Strict',
      likes: 'Punctuality, ordering food, keeping paths clear.',
      dislikes: 'Bicycles left in front of his restaurant door.'
    },
    dialogue: (state) => {
      const relationship = state.npcRelationships['NPC_MATHIAS'] || 50;
      const memories = state.npcMemory['NPC_MATHIAS'] || [];
      const addMathiasMemory = (tag) => {
        if (!memories.includes(tag)) memories.push(tag);
      };

      addMathiasMemory('met_mathias');

      let greetingText = '';
      if (relationship >= 75) {
        greetingText = 'Welcome back, my good friend! Hungry for pizza? ';
      } else if (memories.includes('pizza_bought')) {
        greetingText = 'Ah, you support our pizzeria. Respect! ';
      } else {
        greetingText = 'Hör mal zu, Junge! Keep those delivery bikes clear of my door! ';
      }

      // Quest Step 1: Pizzeria visit
      if (state.questStep === 1) {
        return {
          speaker: 'Herr Mathias Becker',
          text: greetingText + 'Look, we are fully packed and not hiring raw couriers without local recommendations. Go talk to Frau Bäcker at Bäckerei Hansa—she mentioned needing a quick hand this morning!',
          options: [
            {
              label: 'Thanks for the advice! Head to Bakery.',
              action: (game) => {
                game.state.questStep = 2;
                game.state.npcRelationships['NPC_MATHIAS'] += 10;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Quest Updated: Go to Bakery', window.innerWidth / 2, window.innerHeight / 2, '#ECC238');
                game.transitionTo('CITY_EXPLORATION');
              }
            }
          ]
        };
      }

      const canBuy = state.wallet >= 8;
      const options = [
        {
          label: canBuy ? '🍕 Buy Margherita Pizza (8.00€)' : '🍕 Margherita Pizza (8.00€) - Insufficient funds',
          action: (game) => {
            if (canBuy) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 8);
              addMathiasMemory('pizza_bought');
              game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 15);
              game.ui.spawnFloatingText('Pizza bought! Relationship +15', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
              game.ui.updateQuestTracker();
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' });
            } else {
              game.ui.spawnFloatingText('Not enough cash!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
            }
          }
        }
      ];

      // Chat option
      if (!memories.includes('talked_crust')) {
        options.push({
          label: '💬 Ask: "What makes your crust so crisp?"',
          action: (game) => {
            addMathiasMemory('talked_crust');
            game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 15);
            window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
              text: 'It is a 48-hour cold fermentation! And a stone deck oven heated to exactly 420 degrees. Secrets of the trade, my young friend!',
              options: [{ label: 'Wow, interesting!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
          }
        });
      }

      // Gossip
      options.push({
        label: '🗣️ Gossip: "What is your opinion on Nina at Kruma?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            text: 'Nina is a direct girl, very quick, but that "dark store" algorithm business makes people order delivery too much! Fresh pizza is best enjoyed sitting right here in my warm shop.',
            options: [{ label: 'Fair point!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      // Dynamic Need Request
      const myNeeds = state.npcNeeds ? state.npcNeeds['NPC_MATHIAS'] : null;
      if (myNeeds && window.FFH.GrammarEngine) {
        const lowItems = [];
        for (const [itemId, amount] of Object.entries(myNeeds.food)) {
          if (amount < 3) lowItems.push(itemId);
        }
        
        if (lowItems.length > 0) {
          const neededItem = lowItems[Math.floor(Math.random() * lowItems.length)];
          const generatedRequest = window.FFH.GrammarEngine.generateRequest(neededItem);
          
          options.push({
            label: `💬 Request: "${generatedRequest}"`,
            action: (game) => {
              if (game.speech) {
                game.speech.speak(generatedRequest);
              }
              window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
                text: 'We are running out in the kitchen! If you go to the store, fetch this for me quickly!',
                options: [{ label: 'On it, boss!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
            }
          });
        }
      }

      options.push({
        label: 'Leave Pizzeria',
        action: (game) => {
          game.transitionTo('CITY_EXPLORATION');
        }
      });

      return {
        speaker: 'Herr Mathias Becker',
        text: greetingText + 'I have a hot Margherita Pizza right here for 8.00€ if you want to support local business.',
        options: options
      };
    }
  },

  'NPC_MARTHA': {
    id: 'NPC_MARTHA',
    name: 'Martha Webber (Oma)',
    title: 'Hansa Bakery Shopkeeper',
    building: 'B_BAKERY',
    greetingAudio: 'guten_tag',
    avatarColor: '#F4A261',
    personality: {
      type: 'Warm & Grandmotherly',
      likes: 'Politeness, fresh sourdough, warm student stories.',
      dislikes: 'Cold wind, impolite behavior.'
    },
    dialogue: (state) => {
      const relationship = state.npcRelationships['NPC_MARTHA'] || 50;
      const memories = state.npcMemory['NPC_MARTHA'] || [];
      const addMarthaMemory = (tag) => {
        if (!memories.includes(tag)) memories.push(tag);
      };

      addMarthaMemory('met_martha');

      let greetingText = '';
      if (relationship >= 75) {
        greetingText = 'Guten Tag, my dear child! It warms my old heart to see you. ';
      } else if (memories.includes('bread_bought')) {
        greetingText = 'Ah, back for more fresh bread? ';
      } else {
        greetingText = 'Grüß Gott! Welcome to Bäckerei Hansa. ';
      }

      // Quest Step 2: Bakery visit
      if (state.questStep === 2) {
        return {
          speaker: 'Martha Webber (Oma)',
          text: greetingText + 'Oh, we just hired our baking assistants for the week. But if you want good wages, the Kruma Express dark store on the north road is looking for fast delivery riders right now! Head up there.',
          options: [
            {
              label: 'Head to Kruma Express Dark Store',
              action: (game) => {
                game.state.questStep = 3;
                game.state.npcRelationships['NPC_MARTHA'] += 10;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Quest Updated: Go to Kruma', window.innerWidth / 2, window.innerHeight / 2, '#ECC238');
                game.transitionTo('CITY_EXPLORATION');
              }
            }
          ]
        };
      }

      const canBuy = state.wallet >= 3;
      const options = [
        {
          label: canBuy ? '🍞 Buy Fresh Sourdough Bread (3.00€)' : '🍞 Sourdough Bread (3.00€) - Insufficient funds',
          action: (game) => {
            if (canBuy) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 3);
              addMarthaMemory('bread_bought');
              game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 15);
              game.ui.spawnFloatingText('Bread bought! Relationship +15', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
              game.ui.updateQuestTracker();
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' });
            } else {
              game.ui.spawnFloatingText('Not enough cash!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
            }
          }
        }
      ];

      // Chat option
      if (!memories.includes('asked_about_life')) {
        options.push({
          label: '💬 Ask: "How long have you lived in Lübeck?"',
          action: (game) => {
            addMarthaMemory('asked_about_life');
            game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 15);
            window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
              text: 'Over forty years! My late husband and I opened this bakery when the town square was still paved in rough cobblestone. It is a beautiful city.',
              options: [{ label: 'That is wonderful.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
          }
        });
      }

      // Gossip
      options.push({
        label: '🗣️ Gossip: "What do you think of Hans Lokker?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
            text: 'Hans Lokker? Oh, the caretaker at your sublet apartment! He has a grumpy exterior, but he is a soft man underneath. He just wants peace and quiet during the quiet hours (Ruhezeit)! Keep his rules and he will be nice to you.',
            options: [{ label: 'I will remember that.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
        }
      });

      // Dynamic Need Request
      const myNeeds = state.npcNeeds ? state.npcNeeds['NPC_MARTHA'] : null;
      if (myNeeds && window.FFH.GrammarEngine) {
        // Find items she's low on (e.g. less than 3)
        const lowItems = [];
        for (const [itemId, amount] of Object.entries(myNeeds.food)) {
          if (amount < 3) lowItems.push(itemId);
        }
        
        if (lowItems.length > 0) {
          const neededItem = lowItems[Math.floor(Math.random() * lowItems.length)];
          const generatedRequest = window.FFH.GrammarEngine.generateRequest(neededItem);
          
          options.push({
            label: `💬 Request: "${generatedRequest}"`,
            action: (game) => {
              if (game.speech) {
                game.speech.speak(generatedRequest);
              }
              window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                text: 'Could you please bring me some from the Kruma Express? I will pay you handsomely when you deliver it!',
                options: [{ label: 'I will get it for you, Oma Martha!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
            }
          });
        }
      }

      options.push({
        label: 'Back to City',
        action: (game) => {
          game.transitionTo('CITY_EXPLORATION');
        }
      });

      return {
        speaker: 'Martha Webber (Oma)',
        text: greetingText + 'Fresh bread makes every difficult day in a new country a little bit easier, child! A loaf of sourdough is 3.00€.',
        options: options
      };
    }
  },

  'NPC_NINA': {
    id: 'NPC_NINA',
    name: 'Nina Lindemann',
    title: 'Kruma Dispatch Lead',
    building: 'B_DARKSTORE',
    greetingAudio: 'guten_tag',
    avatarColor: '#2A9D8F',
    personality: {
      type: 'Pragmatic & Energetic',
      likes: 'Speedy deliveries, accurate order picking, e-bike upgrades.',
      dislikes: 'Slow pacing, damaged groceries.'
    },
    dialogue: (state) => {
      const relationship = state.npcRelationships['NPC_NINA'] || 50;
      const memories = state.npcMemory['NPC_NINA'] || [];
      const addNinaMemory = (tag) => {
        if (!memories.includes(tag)) memories.push(tag);
      };

      addNinaMemory('met_nina');

      let greetingText = '';
      if (relationship >= 75) {
        greetingText = 'Moin! Always ready for the next shift, you energetic rider! ';
      } else {
        greetingText = 'Moin moin! Welcome to the Kruma Dispatch. ';
      }

      // Quest Step 3: Hired/Start Shift
      if (state.questStep === 3) {
        return {
          speaker: 'Nina Lindemann',
          text: greetingText + 'If you can select the correct German items under pressure and ride safely through city traffic, you will make great money. Ready to clock in for your first shift?',
          options: [
            {
              label: '🚴 Clock In: Start Shift (PICK Phase)',
              action: (game) => {
                game.state.questStep = 4;
                game.state.npcRelationships['NPC_NINA'] += 10;
                game.ui.updateQuestTracker();
                game.sfx.playSfx('success');
                game.transitionTo('PICK');
              }
            },
            {
              label: 'Explore City a bit more',
              action: (game) => {
                game.transitionTo('CITY_EXPLORATION');
              }
            }
          ]
        };
      }

      // Subsequent visits
      const options = [
        {
          label: '🚴 Start Next Delivery Shift',
          action: (game) => {
            game.sfx.playSfx('success');
            game.transitionTo('PICK');
          }
        }
      ];

      // Chat option
      if (!memories.includes('asked_tips')) {
        options.push({
          label: '💬 Ask: "Any tips for speeding up deliveries?"',
          action: (game) => {
            addNinaMemory('asked_tips');
            game.state.npcRelationships['NPC_NINA'] = Math.min(100, game.state.npcRelationships['NPC_NINA'] + 15);
            window.FFH.NPC_DATABASE['NPC_NINA'].currentResponse = {
              text: 'Buy the E-Bike upgrade! It dramatically increases your speed through the cobblestone streets. Also, keep an eye on order freshness!',
              options: [{ label: 'Thanks, Nina!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA' }) }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA', custom: true });
          }
        });
      }

      // Gossip
      options.push({
        label: '🗣️ Gossip: "What is Mathias\'s problem with our delivery bikes?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_NINA'].currentResponse = {
            text: 'Mathias? Oh, he thinks our bikes drive customers away from his tables. Classic old-school restaurant owner! Just park on the opposite sidewalk curb and he won\'t yell.',
            options: [{ label: 'Smart tip!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA', custom: true });
        }
      });

      options.push({
        label: 'Leave Warehouse',
        action: (game) => {
          game.transitionTo('CITY_EXPLORATION');
        }
      });

      return {
        speaker: 'Nina Lindemann',
        text: greetingText + 'All shelves are restocked. What are we doing next?',
        options: options
      };
    }
  },

  'NPC_LOKKER': {
    id: 'NPC_LOKKER',
    name: 'Herr Hans Lokker',
    title: 'WG Caretaker',
    building: 'B_WG',
    greetingAudio: 'guten_tag',
    avatarColor: '#7209B7',
    personality: {
      type: 'Orderly & Strict',
      likes: 'Rule adherence, quiet hours (Ruhezeit) after 22:00, clean stairs.',
      dislikes: 'Loud music, dropping trash in the hallway.'
    },
    dialogue: (state) => {
      const relationship = state.npcRelationships['NPC_LOKKER'] || 50;
      const memories = state.npcMemory['NPC_LOKKER'] || [];
      const addLokkerMemory = (tag) => {
        if (!memories.includes(tag)) memories.push(tag);
      };

      addLokkerMemory('met_lokker');

      let greetingText = '';
      if (relationship >= 75) {
        greetingText = 'Ah, the quietest tenant in the building! Come on in. ';
      } else {
        greetingText = 'Guten Tag. Remember: Quiet hours (Ruhezeit) start at 22:00 sharp! ';
      }

      const options = [
        {
          label: '🏠 Enter Student Room Hub',
          action: (game) => {
            game.transitionTo('SHOP');
          }
        }
      ];

      // Chat option
      if (!memories.includes('talked_rules')) {
        options.push({
          label: '💬 Ask: "How do I ensure I keep the rules correctly?"',
          action: (game) => {
            addLokkerMemory('talked_rules');
            game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, game.state.npcRelationships['NPC_LOKKER'] + 15);
            window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
              text: 'Keep your hallway clear of boxes, vacuum only during the day, and separate your recycling correctly! Paper in the blue bin, plastic in the yellow bag!',
              options: [{ label: 'Understood. I will do that.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
          }
        });
      }

      // Gossip
      options.push({
        label: '🗣️ Gossip: "Who is the loudest person in town?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
            text: 'Mathias Becker! He shouts at the pizza bakers all day long. You can hear his voice clear down the canal when the wind blows east. Highly undisciplined!',
            options: [{ label: 'Hah, true.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
        }
      });

      options.push({
        label: 'Back to City',
        action: (game) => {
          game.transitionTo('CITY_EXPLORATION');
        }
      });

      return {
        speaker: 'Herr Hans Lokker',
        text: greetingText + 'No loud guests allowed overnight.',
        options: options
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
      // Find the specific etiquette scenario for the current shift
      const scenario = window.FFH.dialogue.find(d => d.shift === state.currentShift) || window.FFH.dialogue[window.FFH.dialogue.length - 1];
      
      return {
        speaker: 'Customer',
        text: `${scenario.questionDe}\n\n<i style="color: #666; font-size: 11px;">${scenario.questionEn}</i>`,
        options: scenario.choices.map(choice => ({
          label: choice.textDe,
          en: choice.textEn,
          audioKey: choice.audioKey,
          action: (game) => {
            game.state.lastEtiquetteTipDelta = choice.tipDelta;
            game.ui.spawnFloatingText(choice.correct ? `Gut! ${choice.feedbackDe}` : `Ups! ${choice.feedbackDe}`, window.innerWidth / 2, window.innerHeight / 2, choice.correct ? '#4CAF50' : '#E63946');
            
            // Re-calculate payout with the new lastEtiquetteTipDelta
            game.lastPayout = window.FFH.calculatePayout(game.state);
            game.transitionTo('DEBRIEF_RECEIPT');
          }
        }))
      };
    }
  }
};
