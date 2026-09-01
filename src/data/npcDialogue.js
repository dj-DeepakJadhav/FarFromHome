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
      const addRitaMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_RITA', tag, relDelta, state);
      };
      addRitaMemory('met_rita');

      // Prologue Quest Step 0: Initial Arrival & Strategy Choice
      if (state.questStep === 0) {
        return {
          speaker: 'Rita Schneider (University Registrar)',
          de: 'Welcome to the University of Lübeck! To finalize your enrollment and secure your student visa, you must pay the 250.00€ Semesterbeitrag and register your residence. How do you plan to finance your stay?',
          en: 'Welcome to the University of Lübeck! To finalize your enrollment and secure your student visa, you must pay the 250.00€ Semesterbeitrag and register your residence. How do you plan to finance your stay?',
          options: [
            {
              label: '💼 "I will work courier shifts at Kruma Express!" (The Hustler Path)',
              en: 'Hustler Route: Work courier shifts to earn fast cash and pay tuition.',
              action: (game) => {
                game.state.questStep = 1;
                game.state.storyFlags.chosePath = 'hustler';
                game.state.npcRelationships['NPC_RITA'] += 10;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Path Chosen: Courier Hustler! (+10 Rita)', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                
                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'Very practical! Kruma Express on North Road is always hiring. But beware of slippery cobblestones and strict landlords. First, secure your room with Hans Lokker at the WG Dorm!',
                  options: [{ label: '🏃 "I am on my way!"', en: 'On my way!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '🤝 "I will build goodwill with neighbors and local shopkeepers." (The Diplomat Path)',
              en: 'Diplomatic Route: Talk to neighbors and business owners to build goodwill.',
              action: (game) => {
                game.state.questStep = 1;
                game.state.storyFlags.chosePath = 'diplomat';
                game.state.npcRelationships['NPC_RITA'] += 15;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Path Chosen: Diplomat! (+15 Rita)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'A wise approach. Visit Grandma Martha at Bakery Hansa. She knows everyone in the district and always supports honest students!',
                  options: [{ label: '🥐 "Thank you for the advice, Frau Schneider!"', en: 'Thank you for the advice, Frau Schneider!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '📚 "I will focus on emergency student grants and academic aid." (The Scholar Path)',
              en: 'Scholar Route: Ask about emergency waivers and scholarship deadlines.',
              action: (game) => {
                game.state.questStep = 1;
                game.state.storyFlags.chosePath = 'academic';
                game.state.npcRelationships['NPC_RITA'] += 20;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Path Chosen: Scholar! (+20 Rita)', window.innerWidth / 2, window.innerHeight / 2, '#3A86FF');

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: 'German law is strict, but if you study your German vocabulary diligently, I will write a commendation letter for the immigration office! However, you still need to raise the 250€ tuition.',
                  options: [{ label: '📖 "I will study diligently!"', en: 'I will study diligently!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '🚪 "I will explore the city first."',
              en: 'Explore Lübeck Altstadt first.',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      // Success Enrollment flow
      if (state.wallet >= tuitionGoal && !state.isMatriculated) {
        return {
          speaker: 'Rita Schneider (University Registrar)',
          en: `Excellent! You have saved ${state.wallet.toFixed(2)}€. Would you like to pay your 250.00€ semester fee and receive your official Immatrikulationsbescheinigung (Enrollment Certificate)?`,
          options: [
            {
              label: '🎓 "Yes! Here is the 250.00€ Semesterbeitrag!"',
              en: 'Pay 250.00€ Semesterbeitrag & Get Matriculation Certificate',
              action: (game) => {
                game.state.wallet = window.FFH.round2(game.state.wallet - tuitionGoal);
                game.state.isMatriculated = true;
                game.state.storyFlags.paidSemesterFee = true;
                game.state.npcRelationships['NPC_RITA'] = 100;
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('🎓 Matriculation Complete! Certificate Granted!', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  en: '*OFFICIAL STAMP!* Congratulations! You are officially enrolled as a student at the University of Lübeck. Take your certificate to Sparkasse Bank or Dr. Lindemann at the Ausländerbehörde!',
                  options: [{ label: '🎉 "Thank you very much, Frau Schneider!"', en: 'Thank you very much, Frau Schneider!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '⏳ "I need to hold onto my funds for equipment first."',
              en: 'Hold onto funds for now.',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const remaining = Math.max(0, tuitionGoal - state.wallet).toFixed(2);
      const options = [];

      // Deep Story & Mentorship
      options.push({
        label: '❤️ "Frau Schneider, why do you care so deeply about every student\'s paperwork?"',
        en: 'Ask: "Frau Schneider, why do you care so deeply about each student\'s paperwork?"',
        action: (game) => {
          game.state.npcRelationships['NPC_RITA'] = Math.min(100, game.state.npcRelationships['NPC_RITA'] + 15);
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            de: 'Meine Tochter studierte vor zehn Jahren allein in Tokio. Sie hatte anfangs niemanden und weinte wegen bürokratischer Formulare. Wenn ich euch helfe, helfe ich ihr.',
            en: 'Ten years ago, my daughter studied abroad alone in Tokyo. She had no one and cried over unfamiliar bureaucratic forms. Whenever I help an international student stamp their papers, I feel like I am helping her.',
            options: [{ label: '🥺 "That is truly heartwarming. Thank you, Frau Schneider."', en: 'Thank you for your empathy, Frau Schneider.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      options.push({
        label: '💬 "What is this university famous for?"',
        en: 'Ask: "What is this university famous for?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            de: 'Wir sind ein führendes Exzellenzzentrum für Biomedizinische Technik, Künstliche Intelligenz und Medizin! Unsere Studenten entwickeln bahnbrechende Innovationen.',
            en: 'We are a premier center for biomedical engineering, artificial intelligence, and medicine! Diligent students here achieve global impact.',
            options: [{ label: '🔬 "Fascinating! That motivates me even more."', en: 'Fascinating!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      options.push({
        label: '🗣️ "What can you tell me about the other townspeople?"',
        en: 'Gossip: "What can you tell me about the other townspeople?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            de: 'Herr Lokker im Wohnheim wirkt mürrisch, aber wenn man ihm ein frisches Croissant mitbringt, wird er handzahm. Und Herr Becker in der Pizzeria streitet sich ständig mit den Kurieren!',
            en: 'Herr Lokker seems strict, but if you bring him a fresh bakery croissant, he softens up completely. And Mathias at the Pizzeria is always yelling about courier bicycles!',
            options: [{ label: '💡 "Great insider tip!"', en: 'Great insider tip!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Frau Schneider!" (Leave)',
        en: 'Goodbye, Frau Schneider! (Back to Altstadt)',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let greetingEn = `You currently have ${state.wallet.toFixed(2)}€. You still need ${remaining}€ for your Semesterbeitrag. Work delivery shifts at Kruma Express to earn the rest!`;
      if (state.wallet >= 200 && state.wallet < tuitionGoal) {
        greetingEn = `I can see the hunger and determination in your eyes! You have ${state.wallet.toFixed(2)}€—only ${remaining}€ left to reach your 250.00€ matriculation goal! Go finish one last rush!`;
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
      const addMathiasMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_MATHIAS', tag, relDelta, state);
      };
      addMathiasMemory('met_mathias');

      const options = [];

      // Immigrant Story & Mentorship
      options.push({
        label: '🇮🇹 "Mathias, how did you start your pizzeria in Lübeck?"',
        en: 'Ask: "Mathias, what was your journey arriving in Germany from Italy?"',
        action: (game) => {
          game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 20);
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            de: '1994 kam ich aus Neapel hierher. Minus zehn Grad, kein Wort Deutsch, nur 50 D-Mark und ein alter Schraubenschlüssel! Ich wusch nachts Teller und reparierte tagsüber Fahrräder. Gib niemals auf, junger Freund!',
            en: 'In 1994, I arrived from Naples with minus ten degrees, zero German words, 50 Marks, and an old wrench! I washed dishes at night and fixed bicycles by day. Never give up on your dreams, young friend!',
            options: [{ label: '🔧 "Your story inspires me, Mathias. I will keep pushing!"', en: 'Inspirational!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      // Buying Food & Freshness Boost
      const canBuy = state.wallet >= 8;
      options.push({
        label: canBuy ? '🍕 "One fresh stone-oven Pizza Margherita, please!" (8.00€)' : '🍕 "Pizza Margherita" (8.00€) - Need Cash',
        en: canBuy ? 'Buy fresh stone-oven pizza (8.00€) (+15 Freshness & +15 Relationship)' : 'Need 8.00€ to buy pizza',
        action: (game) => {
          if (canBuy) {
            game.state.wallet = window.FFH.round2(game.state.wallet - 8);
            game.state.freshness = Math.min(100, (game.state.freshness || 100) + 20);
            game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 15);
            game.state.storyFlags.mathiasPizzaOrderCount++;
            game.sfx.playSfx('register');
            game.ui.spawnFloatingText('🍕 Hot Pizza! Freshness +20 & Mathias +15', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            game.ui.updateQuestTracker();
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' });
          } else {
            game.ui.spawnFloatingText('Not enough cash!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
          }
        }
      });

      // Branching Diplomacy: Resolving the Courier Parking Feud
      options.push({
        label: '🤝 "Herr Becker, let\'s agree to park courier bikes across the square!" (Truce)',
        en: 'Propose Parking Truce: Promise to park courier bikes away from his outdoor dining tables.',
        action: (game) => {
          game.state.storyFlags.confrontedMathias = true;
          game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 25);
          game.ui.spawnFloatingText('🤝 Truce Formed! Mathias +25', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
          
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            en: 'Finally, a courier with some sense! If you keep my sidewalk clear, I will give all Kruma riders a 20% discount on fresh pizzas!',
            options: [{ label: '🍕 "Excellent deal, Mathias!"', en: 'Excellent deal!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      // The German Real-Life Dilemma: Off-the-Books Cash Side Shift (Schwarzgeld)
      options.push({
        label: '🤫 "Mathias, my 20-hour visa cap is full, but I desperately need tuition cash!" (Cash Shift)',
        en: 'Offer off-the-books kitchen help: Earn +25.00€ instant cash (Ignores 20h quota, but risk of Zoll inspection).',
        action: (game) => {
          game.state.wallet = window.FFH.round2(game.state.wallet + 25);
          game.state.zollRisk = (game.state.zollRisk || 0) + 15;
          game.sfx.playSfx('success');
          game.ui.spawnFloatingText('💶 +25.00€ Cash in Envelope! (⚠️ Zoll Risk +15%)', window.innerWidth / 2, window.innerHeight / 2, '#F4A261');
          game.ui.updatePersistentHUD(game.state);

          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            en: 'Listen, Kruma already has your Steuer-ID so I cannot register you. But you washed all the dough trays and delivered 4 rush orders! Here is 25.00€ cash in an envelope. Keep your head down if you see Ordnungsamt vans!',
            options: [{ label: '🤝 "Thank you Mathias! My tuition fund is saved!"', en: 'Thank you!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      // Craft Lore
      options.push({
        label: '💬 "What makes your pizza crust so extraordinary?"',
        en: 'Ask: "What makes your crust so extraordinary?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            en: '48-hour cold proofing, authentic Caputo flour, and a stone deck at 420°C! No fast-delivery app can ever replace true artisan baking.',
            options: [{ label: '👨‍🍳 "True craftsmanship!"', en: 'True craftsmanship!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Herr Becker!" (Leave)',
        en: 'Leave Pizzeria',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Herr Mathias Becker',
        en: 'Welcome to Pizzeria Becker! Authentic stone-baked pizza made with patience and passion.',
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
      const addMarthaMemory = (tag, delta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_MARTHA', tag, delta, state);
      };
      addMarthaMemory('met_martha');

      const options = [];

      // Buying Food
      const canBuyBread = state.wallet >= 3;
      options.push({
        label: canBuyBread ? '🍞 "One fresh sourdough loaf, please!" (3.00€)' : '🍞 "Sourdough Bread" (3.00€) - Need Cash',
        en: canBuyBread ? 'Buy Sourdough Bread (3.00€) (+10 Freshness)' : 'Need 3.00€ to buy bread',
        action: (game) => {
          if (canBuyBread) {
            game.state.wallet = window.FFH.round2(game.state.wallet - 3);
            game.state.freshness = Math.min(100, (game.state.freshness || 100) + 10);
            game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 10);
            game.sfx.playSfx('register');
            game.ui.spawnFloatingText('🍞 Sourdough Bread bought! Freshness +10', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            game.ui.updateQuestTracker();
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' });
          } else {
            game.ui.spawnFloatingText('Not enough cash!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
          }
        }
      });

      // Sidequest: Croissant Peace Bribe for Hans Lokker
      const canBuyCroissant = state.wallet >= 2;
      if (!state.storyFlags.hasBakeryCroissant && !state.storyFlags.bribedLokker) {
        options.push({
          label: canBuyCroissant ? '🥐 "I will buy a warm Butter Croissant for Herr Lokker." (2.00€)' : '🥐 "Butter Croissant for Herr Lokker" (2.00€) - Need Cash',
          en: canBuyCroissant ? 'Buy warm Butter Croissant (2.00€) to bribe landlord Hans Lokker' : 'Need 2.00€',
          action: (game) => {
            if (canBuyCroissant) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 2);
              game.state.storyFlags.hasBakeryCroissant = true;
              game.state.inventory.push('fresh_croissant');
              game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 15);
              game.sfx.playSfx('success');
              game.ui.spawnFloatingText('🥐 Butter Croissant in backpack! Deliver to Herr Lokker!', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
              
              window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                en: 'How thoughtful of you! Hans Lokker acts tough about the 22:00 curfew, but fresh croissants melt his heart immediately. Bring it to the WG Dorm!',
                options: [{ label: '🏃 "I will take it to him right away!"', en: 'I will take it to him right away!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
            } else {
              game.ui.spawnFloatingText('Not enough cash!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
            }
          }
        });
      }

      // Emotional Warmth & Maternal Advice
      options.push({
        label: '❤️ "Oma Martha, I feel homesick sometimes. How do you stay so cheerful?"',
        en: 'Ask: "Oma Martha, I miss home sometimes. How do you stay so warm and hopeful?"',
        action: (game) => {
          game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 20);
          window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
            en: 'Oh, my dear child... After the war, this city was in ruins. We rebuilt it brick by brick by looking out for one another. You are not alone in Lübeck. As long as I am baking, this bakery is your home.',
            options: [{ label: '🥺 "Thank you, Oma Martha. Your words give me strength."', en: 'Thank you for your warmth, Oma Martha.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
        }
      });

      // City Lore & History
      options.push({
        label: '💬 "Tell me about Lübeck and the Hanseatic League!"',
        en: 'Ask: "Tell me about Lübeck\'s history!"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
            en: 'Lübeck was the Queen of the Hanseatic League! For 800 years merchants sailed from this very harbor. Reliability and hard work always pay off here.',
            options: [{ label: '⚓ "A proud heritage!"', en: 'A proud heritage!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Oma Martha!" (Leave)',
        en: 'Leave Bakery',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Martha Webber (Oma)',
        en: 'Greetings, my child! Fresh sourdough and warm pastries comfort the soul. How can I help you today?',
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
      const addNinaMemory = (tag, delta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_NINA', tag, delta, state);
      };
      addNinaMemory('met_nina');

      const options = [
        {
          label: '🚴 "Clock In: Standard Delivery Shift (Balanced Payout)"',
          en: 'Clock In: Standard Delivery Shift (Pick orders & ride)',
          action: (game) => {
            game.state.hasJob = true;
            game.state.isVipRush = false;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🚴 Standard Shift Started! Ride safely!', window.innerWidth / 2, window.innerHeight / 2, '#2A9D8F');
            game.transitionTo('PICK');
          }
        },
        {
          label: '🔥 "Clock In: High-Stakes VIP Express Rush (2.5x Tips!)"',
          en: 'Clock In: VIP Rush Shift (Tighter timer, +2.5x customer tips & +15 Nina Rep)',
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

      // Courier Camaraderie & Personal Story
      options.push({
        label: '⚡ "Nina, how did you become the dispatch lead at Kruma?"',
        en: 'Ask: "Nina, how did you work your way up to dispatch lead?"',
        action: (game) => {
          game.state.npcRelationships['NPC_NINA'] = Math.min(100, game.state.npcRelationships['NPC_NINA'] + 15);
          window.FFH.NPC_DATABASE['NPC_NINA'].currentResponse = {
            en: 'Three years ago, I rode 80 kilometers a day through rain and sleet to pay off my own tuition! I know every sore muscle and frozen toe. That is why I manage this warehouse: to make sure every rider gets fair pay and respect.',
            options: [{ label: '🤝 "I respect that deeply, Nina. Let\'s get to work!"', en: 'Deep respect!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA', custom: true });
        }
      });

      // Route Advice & Street Lore
      options.push({
        label: '🗺️ "Any secret shortcuts through the medieval alleys?"',
        en: 'Ask: "Any secret shortcuts through the medieval alleys?"',
        action: (game) => {
          game.state.storyFlags.knowsNinaShortcut = true;
          window.FFH.NPC_DATABASE['NPC_NINA'].currentResponse = {
            en: 'Cut through the narrow alley behind St. Mary\'s Church to avoid the rough cobblestones on Breite Straße! And make sure to buy the E-Bike motor in your dorm room.',
            options: [{ label: '⚡ "Awesome, will do!"', en: 'Awesome, will do!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA', custom: true });
        }
      });

      options.push({
        label: '🚪 "See you next shift, Nina!" (Leave)',
        en: 'Leave Warehouse',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Nina Lindemann',
        en: 'All shelves are restocked and order timers are running. Put on your thermal bag and ride safely!',
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
      type: 'Gruff Exterior, Soft Interior',
      likes: 'Rule adherence, quiet hours (Ruhezeit) after 22:00, clean stairs, respectful students.',
      dislikes: 'Loud party music at night, dropping trash in the hallway.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_LOKKER'] || [];
      const addLokkerMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_LOKKER', tag, relDelta, state);
      };
      addLokkerMemory('met_lokker');

      const options = [
        {
          label: '🏠 "Enter Dorm Room (Buy upgrades, check finances)"',
          en: 'Enter Dorm Room (Buy upgrades, practice flashcards)',
          action: (game) => { game.transitionTo('SHOP'); }
        }
      ];

      // Deep Emotional Backstory
      options.push({
        label: '❤️ "Herr Lokker, why are quiet hours and order so deeply important to you?"',
        en: 'Ask: "Herr Lokker, why are quiet hours and order so important to you?"',
        action: (game) => {
          game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, game.state.npcRelationships['NPC_LOKKER'] + 20);
          window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
            en: 'My late wife Anna loved the peaceful quiet of the evening. She would read by the window whenever St. Mary\'s church bells rang at dusk. When the building is peaceful and orderly, I still feel close to her.',
            options: [{ label: '🥺 "That is beautiful, Herr Lokker. I promise to keep the building peaceful."', en: 'I understand and respect that.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
        }
      });

      // Sidequest Action: Deliver Croissant Bribe
      if (state.storyFlags.hasBakeryCroissant && !state.storyFlags.bribedLokker) {
        options.push({
          label: '🥐 "Herr Lokker, I brought you a warm butter croissant from Bakery Hansa!"',
          en: 'Offer Pastry Gift: Present warm croissant from Bakery Hansa to soften landlord rules.',
          action: (game) => {
            game.state.storyFlags.bribedLokker = true;
            game.state.storyFlags.landlordConfirmationSigned = true;
            game.state.hasApartment = true;
            game.state.npcRelationships['NPC_LOKKER'] = 90;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🥐 Herr Lokker smiles! Landlord Confirmation Signed!', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            game.ui.updateQuestTracker();

            window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
              en: '*Sniffs delightedly* ...A warm butter croissant from Martha?! Well... you clearly possess manners and culture! Here is your signed Wohnungsgeberbestätigung (Landlord Confirmation) for the Bürgeramt!',
              options: [{ label: '📜 "Thank you very much, Herr Lokker!"', en: 'Thank you very much, Mr. Lokker!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
          }
        });
      }

      // House Rules & Trash Sorting Dilemma
      options.push({
        label: '🗑️ "Can you explain the official waste sorting and quiet hour rules?"',
        en: 'Ask: "Please teach me the official German trash separation and quiet hour rules."',
        action: (game) => {
          game.state.storyFlags.separatedTrashCorrectly = true;
          game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, game.state.npcRelationships['NPC_LOKKER'] + 15);
          window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
            en: 'Exemplary! 1. Absolute quiet hours starting promptly at 22:00. 2. Waste sorting is law: Blue bin = Paper/Cardboard, Yellow bag = Packaging/Plastic, Black bin = Residual waste. Proper sorting avoids heavy fines!',
            options: [{ label: '👍 "I will follow these rules strictly!"', en: 'I will follow this strictly!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
        }
      });

      options.push({
        label: '🚪 "Have a pleasant day, Herr Lokker!" (Leave)',
        en: 'Leave Dorm Entrance',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let lokkerGreeting = 'Good day. Remember: The front entrance must remain locked and no shoes are to be left in the shared hallway!';
      if ((state.zollRisk || 0) > 0) {
        lokkerGreeting = '*Sniffs sharply* You smell of wood-smoke, garlic, and pizzeria dough! Doing late night shifts again? Keep your shoes outside, respect the 22:00 Ruhezeit, and don\'t forget to Stoßlüften your room!';
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
      type: 'Helpful & Pragmatic',
      likes: 'Instant coffee, helping newcomers, survival tips.',
      dislikes: 'Bürokratie traps, missing visa deadlines.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_NICO'] || [];
      const addMemory = (tag) => { if (!memories.includes(tag)) memories.push(tag); };
      addMemory('met_nico');

      const options = [];

      // Student Solidarity & Homesickness Conversation
      options.push({
        label: '❤️ "Nico, how do you handle being so far away from your family?"',
        en: 'Ask: "Nico, how do you handle being so far away from your family?"',
        action: (game) => {
          game.state.npcRelationships['NPC_NICO'] = Math.min(100, game.state.npcRelationships['NPC_NICO'] + 20);
          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            en: 'Every Sunday I call my family for two hours. I tell them about the historic towers, the cold winds, and the quirky neighbors. When times get tough, remember why you came here. We will graduate together, my friend!',
            options: [{ label: '🤝 "Thank you, Nico. We will conquer this city together!"', en: 'We will conquer this!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      // Survival Advice
      options.push({
        label: '💡 "What is the secret to surviving the first 28 days in Germany?"',
        en: 'Ask: "Nico, what is the secret to surviving the first month in Germany?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            en: 'Three golden rules: 1. Register at Bürgeramt immediately, or you cannot unlock your bank account. 2. Work Kruma shifts to pay the 250€ tuition. 3. Upgrade your Pocket Notepad in your room to ace German shifts!',
            options: [{ label: '🤝 "Thanks my friend!"', en: 'Thanks my friend!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      // Pfand Bottle Recycling Mini-Action
      options.push({
        label: '🍾 "Nico, let\'s return our empty Club-Mate Pfand bottles!" (+0.75€)',
        en: 'Recycle Pfand Bottles: Return deposit bottles for +0.75€ instant cash.',
        action: (game) => {
          game.state.wallet = window.FFH.round2(game.state.wallet + 0.75);
          game.sfx.playSfx('register');
          game.ui.spawnFloatingText('🍾 Pfand bottles recycled! +0.75€ Cash!', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
          game.ui.updatePersistentHUD(game.state);

          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            en: 'Pfand deposit is the secret student safety net in Germany! 3 glass bottles = 0.75€. That pays for a fresh pack of oats at the supermarket!',
            options: [{ label: '🪙 "Every cent counts!"', en: 'Every cent counts!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      // Ventilation & Freshness Recovery
      options.push({
        label: '🪟 "Let\'s do 5 minutes of Stoßlüften in the room!" (+20 Freshness)',
        en: 'Shock-Ventilate Dorm: Open windows wide for complete fresh air exchange (+20 Freshness).',
        action: (game) => {
          game.state.storyFlags.stosslueftenCount++;
          game.state.freshness = Math.min(100, (game.state.freshness || 100) + 20);
          game.sfx.playSfx('success');
          game.ui.spawnFloatingText('🌬️ Fresh Baltic breeze! Freshness +20', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');

          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            en: 'Wonderful! Crisp Baltic sea breeze. Shock ventilation clears mental fatigue and keeps Herr Lokker smiling!',
            options: [{ label: '🌬️ "I feel completely refreshed!"', en: 'I feel completely refreshed!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      options.push({
        label: '🚪 "See you later, Nico!"',
        en: 'Goodbye, Nico!',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Nico (Roommate)',
        en: 'Hey! We international students look out for each other. Don\'t let the German bureaucracy intimidate you!',
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
      const addMemory = (tag) => { if (!memories.includes(tag)) memories.push(tag); };
      addMemory('met_vogel');

      // Successful Registration Flow
      if (!state.hasAnmeldung && (state.hasApartment || state.storyFlags.landlordConfirmationSigned)) {
        return {
          speaker: 'Herr Vogel (Bürgeramt)',
          en: 'Good day. Ticket B-104? Please step forward. Do you have your passport and the official landlord confirmation (Wohnungsgeberbestätigung)?',
          options: [
            {
              label: '📑 "Yes! Here is the landlord confirmation from Herr Lokker and my passport!"',
              en: 'Submit landlord confirmation to register municipal residence',
              action: (game) => {
                game.state.hasAnmeldung = true;
                game.state.inventory.push('meldebescheinigung');
                game.state.npcRelationships['NPC_VOGEL'] = 100;
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('📑 Registration Complete! Meldebescheinigung Granted!', window.innerWidth / 2, window.innerHeight / 2, '#1D3557');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: '*DOUBLE OFFICIAL STAMP!* Outstanding. You are now officially registered as a resident of the Free and Hanseatic City of Lübeck! Take this certificate to Sparkasse Bank to unfreeze your blocked account.',
                  options: [{ label: '🏦 "Thank you very much, Herr Vogel!"', en: 'Thank you very much, Mr. Vogel!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Bureaucracy Philosophy
      options.push({
        label: '📜 "Herr Vogel, why do German offices require so many stamped certificates?"',
        en: 'Ask: "Herr Vogel, why is paperwork so meticulous in Germany?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
            en: 'Forms are the foundation of public trust and equality! An official stamp prevents arbitrary rulings. Once your paper is stamped with the city seal, your legal rights are absolute and protected forever.',
            options: [{ label: '🏛️ "I never looked at it that way. That is profound."', en: 'That is profound.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Herr Vogel!" (Leave)',
        en: 'Leave Bürgeramt',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let statusMsgEn = state.hasAnmeldung ?
        'Your municipal registration certificate is formally issued. Visit Sparkasse Bank next.' :
        'Without a signed landlord confirmation (Wohnungsgeberbestätigung) from Hans Lokker, I cannot register you! Please bring the document.';

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
      const addMemory = (tag) => { if (!memories.includes(tag)) memories.push(tag); };
      addMemory('met_weber');

      // Unlocking Blocked Bank Account
      if (!state.isSperrkontoUnlocked && state.hasAnmeldung && state.isMatriculated) {
        return {
          speaker: 'Frau Weber (Sparkasse Bank)',
          en: 'Good day! You brought both your university enrollment and municipal registration certificate. Shall we activate your German checking account and unfreeze your monthly blocked account allowance?',
          options: [
            {
              label: '💳 "Yes, please activate my checking account and disburse the first monthly allowance!"',
              en: 'Activate blocked account & receive first 50.00€ monthly disbursement',
              action: (game) => {
                game.state.isSperrkontoUnlocked = true;
                game.state.wallet = window.FFH.round2(game.state.wallet + 50);
                game.state.npcRelationships['NPC_WEBER'] = 100;
                game.sfx.playSfx('register');
                game.ui.spawnFloatingText('💳 Sperrkonto Activated! +50.00€ credited!', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  en: 'Excellent! Your checking account is live and your first 50.00€ allowance is credited. All your documents are now complete to submit your final visa dossier to Dr. Lindemann!',
                  options: [{ label: '🏛️ "I will head straight to immigration!"', en: 'I will head straight to immigration!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Financial Wisdom
      options.push({
        label: '💳 "Frau Weber, what is the best financial advice for an international student?"',
        en: 'Ask: "Frau Weber, what financial advice do you have for student couriers?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
            en: 'Always reinvest early profits into tools that multiply your time! An E-Bike conversion or Thermal Bag pays for itself in just a few shifts through higher speed streaks and zero food spoilage.',
            options: [{ label: '📈 "Smart economic advice. Thank you!"', en: 'Smart economic advice.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Frau Weber!" (Leave)',
        en: 'Leave Bank',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let statusMsgEn = state.isSperrkontoUnlocked ? 
        'Your German checking account is active with regular monthly disbursements.' :
        'To unlock your Sperrkonto, I need your university enrollment certificate and municipal registration from the Bürgeramt.';

      return {
        speaker: 'Frau Weber (Sparkasse Bank)',
        en: statusMsgEn,
        options: options
      };
    }
  },

  // 9. FRAU DR. LINDEMANN (Ausländerbehörde Immigration Boss & Finale)
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
      const hasAllDocuments = state.isMatriculated && (state.hasApartment || state.storyFlags.landlordConfirmationSigned) && state.hasAnmeldung && state.isSperrkontoUnlocked;

      if (hasAllDocuments) {
        return {
          speaker: 'Dr. Lindemann (Immigration Office)',
          en: 'Good day. Inspecting your dossier: University Matriculation? Approved. Apartment Lease? Approved. City Registration? Approved. Bank Sperrkonto? Activated! You have worked with immense courage and resilience. Are you ready to receive your permanent Residence Permit?',
          options: [
            {
              label: '🎓 "Yes! I submit my completed dossier for my official Residence Permit!" (WIN GAME!)',
              en: 'Submit completed immigration dossier (WIN GAME!)',
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
      if (!state.isMatriculated) missingList.push('🎓 University Matriculation (Pay 250€ Semesterbeitrag)');
      if (!state.hasApartment && !state.storyFlags.landlordConfirmationSigned) missingList.push('🏠 Landlord Confirmation (Hans Lokker at WG)');
      if (!state.hasAnmeldung) missingList.push('📑 City Registration (Herr Vogel at Rathaus)');
      if (!state.isSperrkontoUnlocked) missingList.push('💳 Bank Account Activation (Frau Weber at Sparkasse)');

      return {
        speaker: 'Dr. Lindemann (Immigration Office)',
        en: `Good day. Your 28-day visa countdown is running! Your dossier is still missing: ${missingList.join(', ')}. Complete all steps across the city before the deadline expires!`,
        options: [
          {
            label: '🏃 "I will collect the missing documents immediately!"',
            en: 'I will collect the missing documents immediately!',
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
      const options = [];

      // Rival Speed Challenge & Skill Point Grant
      options.push({
        label: '⚡ "Klaus, teach me how you take sharp cobblestone turns without skidding!"',
        en: 'Ask: "Klaus, teach me how you take sharp turns on wet cobblestones!"',
        action: (game) => {
          game.state.skillPoints = (game.state.skillPoints || 0) + 1;
          game.state.npcRelationships['NPC_KLAUS'] = Math.min(100, game.state.npcRelationships['NPC_KLAUS'] + 20);
          game.sfx.playSfx('success');
          game.ui.spawnFloatingText('⚡ Learned Corner Drift! +1 Skill Point!', window.innerWidth / 2, window.innerHeight / 2, '#FF5400');
          game.ui.updatePersistentHUD(game.state);

          window.FFH.NPC_DATABASE['NPC_KLAUS'].currentResponse = {
            en: 'Lean your body weight inside the turn, feather the rear brake, and never pedal over wet tram tracks! You have real talent, rookie. Keep this momentum going!',
            options: [{ label: '🚴 "Thanks Klaus! Catch me on the leaderboard!"', en: 'Catch me on the leaderboard!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS', custom: true });
        }
      });

      // Courier Rivalry Lore
      options.push({
        label: '🔥 "Why do you and Nina constantly debate route strategies?"',
        en: 'Ask: "Why do you and Nina constantly debate route efficiency?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_KLAUS'].currentResponse = {
            en: 'Nina prioritizes perfect item safety and zero customer complaints. I prioritize pure aerodynamic speed! But together, we make Kruma Express the fastest dispatch crew in northern Germany.',
            options: [{ label: '⚡ "Two sides of the same coin!"', en: 'Two sides of the same coin!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_KLAUS', custom: true });
        }
      });

      options.push({
        label: '🚪 "See you on the road, Klaus!" (Leave)',
        en: 'Leave Warehouse',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Klaus "Der Blitz"',
        en: 'Moin! Every second on the street is cash in your pocket. Upgrade your bike and keep your tires pumped to 4 bar!',
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
      const options = [];

      // Emergency Student Hardship Bursary
      if (!state.storyFlags.receivedAstaGrant) {
        options.push({
          label: '📑 "Dr. Schmidt, I need advice on student rights and emergency visa funds!" (+1 Skill Point)',
          en: 'Consult AStA Counsel: Receive emergency legal orientation and +1 Skill Point.',
          action: (game) => {
            game.state.storyFlags.receivedAstaGrant = true;
            game.state.skillPoints = (game.state.skillPoints || 0) + 1;
            game.state.npcRelationships['NPC_ANKE'] = 100;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('📑 Legal Rights Learned! +1 Skill Point!', window.innerWidth / 2, window.innerHeight / 2, '#4CC9F0');
            game.ui.updatePersistentHUD(game.state);

            window.FFH.NPC_DATABASE['NPC_ANKE'].currentResponse = {
              en: 'Never let administrative pressure intimidate you! International students have full legal rights under German higher education law. Use your Skill Tree to decode Beamtendeutsch and protect your visa.',
              options: [{ label: '🤝 "Thank you so much, Dr. Schmidt!"', en: 'Thank you so much!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE' }) }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE', custom: true });
          }
        });
      }

      // Tenant Rights Consultation
      options.push({
        label: '🏠 "What are my legal rights against strict landlords like Herr Lokker?"',
        en: 'Ask: "What are my legal rights as a tenant in student housing?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_ANKE'].currentResponse = {
            en: 'Landlords cannot enter your room unannounced, and minor wear-and-tear is covered by law. But honoring quiet hours (Ruhezeit) and keeping common areas tidy prevents 99% of disputes!',
            options: [{ label: '💡 "Empowering knowledge!"', en: 'Empowering knowledge!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_ANKE', custom: true });
        }
      });

      options.push({
        label: '🚪 "Goodbye, Dr. Schmidt!" (Leave)',
        en: 'Leave AStA Office',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Dr. Anke Schmidt (AStA Legal Aid)',
        en: 'Welcome to the Student Union! We protect international students from bureaucratic traps and unfair housing practices. How can I advocate for you today?',
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
            game.ui.spawnFloatingText(choice.correct ? `✨ ${choice.feedbackEn}` : `⚠️ ${choice.feedbackEn}`, window.innerWidth / 2, window.innerHeight / 2, choice.correct ? '#4CAF50' : '#E63946');
            
            game.lastPayout = window.FFH.calculatePayout(game.state);
            game.transitionTo('DEBRIEF_RECEIPT');
          }
        }))
      };
    }
  }
};
