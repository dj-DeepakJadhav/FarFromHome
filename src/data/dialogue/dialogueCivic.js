// Civic & University Officials Dialogue (Rita, Vogel, Weber, Lindemann)
window.FFH = window.FFH || {};
window.FFH.NPC_DATABASE = window.FFH.NPC_DATABASE || {};

Object.assign(window.FFH.NPC_DATABASE, {
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

  // 2. MATHIAS BECKER (Pizzeria Boss & Traditionalist),

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
          en: 'Guten Tag. Under §17 of the Federal Registration Act, living in Germany without an official Meldebescheinigung is legally equivalent to not existing at all. Do you possess your landlord\'s signed confirmation, or are you currently an imaginary person?',
          options: [
            {
              label: '🇬🇧 "Good day, Herr Vogel. I prefer existing if possible. Here is my paperwork."',
              action: (game) => {
                addVogelMemory('introduced_vogel');
                addVogelMemory('polite_to_vogel');
                game.state.npcRelationships['NPC_VOGEL'] = Math.min(100, (game.state.npcRelationships['NPC_VOGEL'] || 50) + 15);
                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  en: 'Splendid. Herr Lokker\'s signature must sit inside the box, not touch the border. A signature touching the border is a municipal tragedy.',
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

  // 8. FRAU WEBER (Sparkasse Bank Advisor),

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

  // 9. FRAU DR. LINDEMANN (Ausländerbehörde Immigration Boss & Climax),

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
                  en: '*Reads Martha\'s letter carefully* Bakery owner Martha Beck writes that you risked your courier shift to bike life-saving heart medicine to an 84-year-old pensioner through Baltic sleet. Administrative rules exist to protect society, and you have proven yourself a protector of our community. The Zoll flag is permanently revoked!',
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
});
