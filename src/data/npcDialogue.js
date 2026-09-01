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
          speaker: 'Rita Schneider (Registrar)',
          de: 'Guten Tag. Willkommen an der Universität zu Lübeck! Bitte halten Sie Ihren Zulassungsbescheid und die Semestergebühr bereit.',
          en: 'Good day! Welcome to the University of Lübeck. To finalize your student enrollment and secure your visa, you must pay the 250.00€ Semesterbeitrag and register your residence. How do you plan to finance your stay?',
          options: [
            {
              label: '💼 "Ich suche sofort Arbeit als Fahrradkurier bei Kruma!" (The Hustler Path)',
              en: 'Hustler Route: Work night courier shifts to earn fast cash and pay rent.',
              action: (game) => {
                game.state.questStep = 1;
                game.state.storyFlags.chosePath = 'hustler';
                game.state.npcRelationships['NPC_RITA'] += 10;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Pfad gewählt: Kurier-Hustler! (+10 Beziehung)', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                
                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  de: 'Sehr pragmatisch! Kruma Express an der Nordstraße sucht immer Kuriere. Aber Vorsicht: Die Stadt ist voller Pflastersteine und strenger Vermieter. Gehen Sie zuerst zu Hans Lokker im Studentenwohnheim!',
                  en: 'Very practical! Kruma Express on North Road is always hiring. But beware of slippery cobblestones and strict landlords. First, secure your room with Hans Lokker at the WG Dorm!',
                  options: [{ label: '🏃 "Ich mache mich sofort auf den Weg!"', en: 'On my way!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '🤝 "Ich suche günstige Kontakte und Freunde in der Stadt." (The Diplomat Path)',
              en: 'Diplomatic Route: Talk to neighbors and business owners to build goodwill.',
              action: (game) => {
                game.state.questStep = 1;
                game.state.storyFlags.chosePath = 'diplomat';
                game.state.npcRelationships['NPC_RITA'] += 15;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Pfad gewählt: Diplomat! (+15 Beziehung)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  de: 'Ein kluger Ansatz. Besuchen Sie Oma Martha in der Bäckerei Hansa. Sie kennt jeden im Viertel und hilft Studenten immer gerne aus!',
                  en: 'A wise approach. Visit Grandma Martha at Bakery Hansa. She knows everyone in the district and always supports honest students!',
                  options: [{ label: '🥐 "Danke für den Rat, Frau Schneider!"', en: 'Thank you for the advice, Frau Schneider!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '📚 "Gibt es Stipendien oder Fristverlängerungen für internationale Studenten?" (The Academic Path)',
              en: 'Academic Route: Ask about emergency waivers and scholarship deadlines.',
              action: (game) => {
                game.state.questStep = 1;
                game.state.storyFlags.chosePath = 'academic';
                game.state.npcRelationships['NPC_RITA'] += 20;
                game.ui.updateQuestTracker();
                game.ui.spawnFloatingText('Pfad gewählt: Akademiker! (+20 Beziehung)', window.innerWidth / 2, window.innerHeight / 2, '#3A86FF');

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  de: 'Das Gesetz ist streng, aber wenn Sie Ihr Vokabel-Wörterbuch fleißig lernen und Bestnoten erzielen, helfe ich Ihnen bei der Ausländerbehörde! Jetzt müssen Sie jedoch zunächst die 250€ Gebühr aufbringen.',
                  en: 'German law is strict, but if you study your German vocabulary diligently, I will write a commendation letter for the immigration office! However, you still need to raise the 250€ tuition.',
                  options: [{ label: '📖 "Ich werde fleißig lernen!"', en: 'I will study diligently!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '🚪 "Ich schaue mich erst in Lübeck um." (Explore City)',
              en: 'Explore Lübeck Altstadt first.',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      // Success Enrollment flow
      if (state.wallet >= tuitionGoal && !state.isMatriculated) {
        return {
          speaker: 'Rita Schneider',
          de: `Ausgezeichnet! Sie haben ${state.wallet.toFixed(2)}€ gesammelt. Möchten Sie den Semesterbeitrag von 250.00€ jetzt bezahlen und sich immatrikulieren?`,
          en: `Excellent! You have ${state.wallet.toFixed(2)}€. Would you like to pay your 250.00€ semester fee and receive your official Immatrikulationsbescheinigung (Enrollment Certificate)?`,
          options: [
            {
              label: '🎓 "Ja! Hier sind 250.00€ für den Semesterbeitrag!" (Pay Fee)',
              en: 'Pay 250.00€ Semesterbeitrag & Get Matriculation Certificate',
              action: (game) => {
                game.state.wallet = window.FFH.round2(game.state.wallet - tuitionGoal);
                game.state.isMatriculated = true;
                game.state.storyFlags.paidSemesterFee = true;
                game.state.npcRelationships['NPC_RITA'] = 100;
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('🎓 Immatrikulation abgeschlossen! Bescheinigung erhalten!', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
                  de: '*STEMPEL!* Herzlichen Glückwunsch! Sie sind nun offiziell Student an der Universität zu Lübeck. Gehen Sie nun mit Ihrer Bescheinigung zur Sparkasse oder Ausländerbehörde!',
                  en: '*OFFICIAL STAMP!* Congratulations! You are officially enrolled. Take your certificate to Sparkasse Bank or the Ausländerbehörde to complete your visa dossier!',
                  options: [{ label: '🎉 "Vielen Dank, Frau Schneider!"', en: 'Thank you very much, Ms. Schneider!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
              }
            },
            {
              label: '⏳ "Ich möchte das Geld noch für Ausrüstung sparen."',
              en: 'Hold onto funds for now.',
              action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
            }
          ]
        };
      }

      const remaining = Math.max(0, tuitionGoal - state.wallet).toFixed(2);
      const options = [];

      // Chat & Cultural Inquiries
      options.push({
        label: '💬 "Wofür ist diese Universität international bekannt?"',
        en: 'Ask: "What is this university famous for?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            de: 'Wir sind ein führendes Exzellenzzentrum für Biomedizinische Technik, Künstliche Intelligenz und Medizin! Unsere Studenten entwickeln bahnbrechende Innovationen.',
            en: 'We are a premier center for biomedical engineering, artificial intelligence, and medicine! Diligent students here achieve global impact.',
            options: [{ label: '🔬 "Faszinierend! Das motiviert mich noch mehr."', en: 'Fascinating!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      options.push({
        label: '🗣️ "Was für Gerüchte gibt es über die anderen Bürger im Viertel?"',
        en: 'Gossip: "What can you tell me about the other townspeople?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_RITA'].currentResponse = {
            de: 'Herr Lokker im Wohnheim wirkt mürrisch, aber wenn man ihm ein frisches Croissant mitbringt, wird er handzahm. Und Herr Becker in der Pizzeria streitet sich ständig mit den Kurieren!',
            en: 'Herr Lokker seems strict, but if you bring him a fresh bakery croissant, he softens up completely. And Mathias at the Pizzeria is always yelling about courier bicycles!',
            options: [{ label: '💡 "Das ist ein wertvoller Insider-Tipp!"', en: 'Great insider tip!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_RITA', custom: true });
        }
      });

      options.push({
        label: '🚪 "Auf Wiedersehen, Frau Schneider!" (Leave)',
        en: 'Goodbye, Frau Schneider! (Back to Altstadt)',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Rita Schneider (Registrar)',
        de: `Guten Tag. Sie haben aktuell ${state.wallet.toFixed(2)}€. Für die Immatrikulation fehlen noch ${remaining}€. Arbeiten Sie fleißig bei Kruma Express!`,
        en: `You currently have ${state.wallet.toFixed(2)}€. You still need ${remaining}€ for your Semesterbeitrag. Work delivery shifts at Kruma Express to earn the rest!`,
        options: options
      };
    }
  },

  // 2. MATHIAS BECKER (Pizzeria Boss & Traditionalist)
  'NPC_MATHIAS': {
    id: 'NPC_MATHIAS',
    name: 'Herr Mathias Becker',
    title: 'Pizzeria Chef & Eigentümer',
    building: 'B_PIZZA',
    greetingAudio: 'guten_tag',
    avatarColor: '#E76F51',
    personality: {
      type: 'Hot-Tempered Craftsman',
      likes: 'Crispy dough, polite customers, peace on his dining terrace.',
      dislikes: 'Bicycles parked on sidewalks, fast-food delivery apps.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_MATHIAS'] || [];
      const addMathiasMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_MATHIAS', tag, relDelta, state);
      };
      addMathiasMemory('met_mathias');

      const options = [];

      // Buying Food & Freshness Boost
      const canBuy = state.wallet >= 8;
      options.push({
        label: canBuy ? '🍕 "Eine frische Steinofen-Pizza Margherita, bitte!" (8.00€)' : '🍕 "Pizza Margherita" (8.00€) - Zu wenig Bargeld',
        en: canBuy ? 'Buy fresh stone-oven pizza (8.00€) (+15 Freshness & +15 Relationship)' : 'Need 8.00€ to buy pizza',
        action: (game) => {
          if (canBuy) {
            game.state.wallet = window.FFH.round2(game.state.wallet - 8);
            game.state.freshness = Math.min(100, (game.state.freshness || 100) + 20);
            game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 15);
            game.state.storyFlags.mathiasPizzaOrderCount++;
            game.sfx.playSfx('register');
            game.ui.spawnFloatingText('🍕 Heiß gegessen! Frische +20 & Mathias +15', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            game.ui.updateQuestTracker();
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' });
          } else {
            game.ui.spawnFloatingText('Nicht genug Bargeld!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
          }
        }
      });

      // Branching Diplomacy: Resolving the Courier Parking Feud
      options.push({
        label: '🤝 "Herr Becker, wir können die Kruma-Fahrräder drüben am Parkplatz abstellen!" (Truce)',
        en: 'Propose Parking Truce: Promise to park courier bikes away from his outdoor dining tables.',
        action: (game) => {
          game.state.storyFlags.confrontedMathias = true;
          game.state.npcRelationships['NPC_MATHIAS'] = Math.min(100, game.state.npcRelationships['NPC_MATHIAS'] + 25);
          game.ui.spawnFloatingText('🤝 Waffenstillstand geschlossen! Mathias +25', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
          
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            de: 'Endlich mal ein Kurier mit Verstand und Benehmen! Wenn ihr den Gehweg freihaltet, gebe ich euch Kruma-Fahrern ab sofort 20% Rabatt auf frische Pizzen!',
            en: 'Finally, a courier with some sense! If you keep my sidewalk clear, I will give all Kruma riders a 20% discount on fresh pizzas!',
            options: [{ label: '🍕 "Perfekt! Das ist ein super Deal."', en: 'Excellent deal!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      // Craft Lore
      options.push({
        label: '💬 "Was ist das Geheimnis Ihres Pizzateigs?"',
        en: 'Ask: "What makes your crust so extraordinary?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_MATHIAS'].currentResponse = {
            de: '48 Stunden kalte Teigführung, italienisches Caputo-Mehl und ein Steinofen bei 420 Grad! Kein Lieferdienst der Welt kann diese knusprige Kruste ersetzen!',
            en: '48-hour cold proofing, authentic Caputo flour, and a stone deck at 420°C! No fast-delivery app can ever replace true artisan baking.',
            options: [{ label: '👨‍🍳 "Wahre Handwerkskunst!"', en: 'True craftsmanship!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MATHIAS', custom: true });
        }
      });

      options.push({
        label: '🚪 "Auf Wiedersehen, Herr Becker!" (Leave)',
        en: 'Leave Pizzeria',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Herr Mathias Becker',
        de: 'Moin! Bei mir gibt es echte Steinofen-Pizza. Keine kalte Lieferpappe, sondern echte italienische Tradition!',
        en: 'Welcome to Pizzeria Becker! Authentic stone-baked pizza made with patience and passion.',
        options: options
      };
    }
  },

  // 3. MARTHA WEBBER (Bakery Grandma & District Heart)
  'NPC_MARTHA': {
    id: 'NPC_MARTHA',
    name: 'Martha Webber (Oma)',
    title: 'Bäckerei Hansa Inhaberin',
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
        label: canBuyBread ? '🍞 "Ein frisches Sauerteigbrot, bitte!" (3.00€)' : '🍞 "Sauerteigbrot" (3.00€) - Zu wenig Bargeld',
        en: canBuyBread ? 'Buy Sourdough Bread (3.00€) (+10 Freshness)' : 'Need 3.00€ to buy bread',
        action: (game) => {
          if (canBuyBread) {
            game.state.wallet = window.FFH.round2(game.state.wallet - 3);
            game.state.freshness = Math.min(100, (game.state.freshness || 100) + 10);
            game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 10);
            game.sfx.playSfx('register');
            game.ui.spawnFloatingText('🍞 Sauerteigbrot gekauft! Frische +10', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            game.ui.updateQuestTracker();
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' });
          } else {
            game.ui.spawnFloatingText('Nicht genug Bargeld!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
          }
        }
      });

      // Sidequest: Croissant Peace Bribe for Hans Lokker
      const canBuyCroissant = state.wallet >= 2;
      if (!state.storyFlags.hasBakeryCroissant && !state.storyFlags.bribedLokker) {
        options.push({
          label: canBuyCroissant ? '🥐 "Ich kaufe ein warmes Butter-Croissant für Herrn Lokker." (2.00€)' : '🥐 "Butter-Croissant für Herrn Lokker" (2.00€) - Zu wenig Geld',
          en: canBuyCroissant ? 'Buy warm Butter Croissant (2.00€) to bribe landlord Hans Lokker' : 'Need 2.00€',
          action: (game) => {
            if (canBuyCroissant) {
              game.state.wallet = window.FFH.round2(game.state.wallet - 2);
              game.state.storyFlags.hasBakeryCroissant = true;
              game.state.inventory.push('fresh_croissant');
              game.state.npcRelationships['NPC_MARTHA'] = Math.min(100, game.state.npcRelationships['NPC_MARTHA'] + 15);
              game.sfx.playSfx('success');
              game.ui.spawnFloatingText('🥐 Butter-Croissant im Rucksack! Bringe es zu Herrn Lokker!', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
              
              window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
                de: 'Wie aufmerksam von dir! Hans Lokker tut immer so streng wegen der 22-Uhr-Ruhezeit, aber bei frischen Butter-Croissants schmilzt sein Herz wie Butter in der Sonne!',
                en: 'How thoughtful of you! Hans Lokker acts tough about the 22:00 curfew, but fresh croissants melt his heart immediately. Bring it to the WG Dorm!',
                options: [{ label: '🏃 "Ich bringe es sofort zu ihm!"', en: 'I will take it to him right away!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
              };
              game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
            } else {
              game.ui.spawnFloatingText('Nicht genug Bargeld!', window.innerWidth / 2, window.innerHeight / 2, '#FF5252');
            }
          }
        });
      }

      // City Lore & History
      options.push({
        label: '💬 "Erzählen Sie mir von Lübeck und der Hansezeit!"',
        en: 'Ask: "Tell me about Lübeck\'s history!"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_MARTHA'].currentResponse = {
            de: 'Lübeck war die Königin der Hanse! Schon vor 800 Jahren segelten Händler von diesem Hafen bis nach Bergen und Nowgorod. Fleiß und Zuverlässigkeit zahlen sich hier immer aus.',
            en: 'Lübeck was the Queen of the Hanseatic League! For 800 years merchants sailed from this very harbor. Reliability and hard work always pay off here.',
            options: [{ label: '⚓ "Eine stolze Tradition!"', en: 'A proud heritage!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_MARTHA', custom: true });
        }
      });

      options.push({
        label: '🚪 "Auf Wiedersehen, Oma Martha!" (Leave)',
        en: 'Leave Bakery',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Martha Webber (Oma)',
        de: 'Grüß Gott, mein Kind! Frischer Sauerteig und warmes Gebäck wärmen die Seele. Wie kann ich dir heute helfen?',
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
      type: 'Pragmatic & Energetic',
      likes: 'Speedy deliveries, accurate order picking, e-bike upgrades.',
      dislikes: 'Slow pacing, damaged groceries.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_NINA'] || [];
      const addNinaMemory = (tag, delta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_NINA', tag, delta, state);
      };
      addNinaMemory('met_nina');

      const options = [
        {
          label: '🚴 "Ich starte sofort eine Liefer-Schicht!" (Start Shift)',
          en: 'Clock In: Start Delivery Shift (Pick orders & ride)',
          action: (game) => {
            game.state.hasJob = true;
            game.sfx.playSfx('success');
            game.transitionTo('PICK');
          }
        }
      ];

      // Route Advice & Street Lore
      options.push({
        label: '🗺️ "Hast du Tipps für die schnellsten Routen durch die Altstadt?"',
        en: 'Ask: "Any secret shortcuts through the medieval alleys?"',
        action: (game) => {
          game.state.storyFlags.knowsNinaShortcut = true;
          window.FFH.NPC_DATABASE['NPC_NINA'].currentResponse = {
            de: 'Fahre hinter der Marienkirche durch die engen Gänge, um das Kopfsteinpflaster auf der Breiten Straße zu umgehen! Und kauf dir im Zimmer das E-Bike Upgrade!',
            en: 'Cut through the narrow alley behind St. Mary\'s Church to avoid the rough cobblestones on Breite Straße! And make sure to buy the E-Bike motor in your dorm room.',
            options: [{ label: '⚡ "Klasse, das spart wertvolle Sekunden!"', en: 'Awesome, will do!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA', custom: true });
        }
      });

      // Gossip about Mathias
      options.push({
        label: '🗣️ "Mathias Becker beschwert sich über die Lieferräder vor seiner Pizzeria."',
        en: 'Discuss: "Mathias Becker is upset about bikes parked near his terrace."',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_NINA'].currentResponse = {
            de: 'Mathias meckert gern, aber wenn wir höflich bleiben und drüben am Marktplatz parken, gibt er uns Rabatt auf seine Pizza. Diplomatie lohnt sich in dieser Stadt!',
            en: 'Mathias grumbles a lot, but if we park across by the Marktplatz, he offers rider discounts. A little diplomacy goes a long way!',
            options: [{ label: '👍 "Verstanden!"', en: 'Got it!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NINA', custom: true });
        }
      });

      options.push({
        label: '🚪 "Bis zur nächsten Schicht, Nina!" (Leave)',
        en: 'Leave Warehouse',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Nina Lindemann',
        de: 'Moin! Die Regale sind gefüllt und die Bestellungen ticken. Schnall dir die Tasche um und fahr vorsichtig!',
        en: 'All shelves are restocked and order timers are running. Put on your thermal bag and ride safely!',
        options: options
      };
    }
  },

  // 5. HANS LOKKER (Strict Caretaker & Landlord)
  'NPC_LOKKER': {
    id: 'NPC_LOKKER',
    name: 'Herr Hans Lokker',
    title: 'Hausverwalter & Vermieter',
    building: 'B_WG',
    greetingAudio: 'guten_tag',
    avatarColor: '#7209B7',
    personality: {
      type: 'Orderly & Strict',
      likes: 'Rule adherence, quiet hours (Ruhezeit) after 22:00, clean stairs.',
      dislikes: 'Loud music, dropping trash in the hallway.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_LOKKER'] || [];
      const addLokkerMemory = (tag, relDelta = 0) => {
        if (window.FFH.NPCMemoryManager) window.FFH.NPCMemoryManager.recordEncounter('NPC_LOKKER', tag, relDelta, state);
      };
      addLokkerMemory('met_lokker');

      const options = [
        {
          label: '🏠 "Ich gehe in mein WG-Zimmer." (Room Hub & Upgrades)',
          en: 'Enter Dorm Room (Buy upgrades, practice flashcards)',
          action: (game) => { game.transitionTo('SHOP'); }
        }
      ];

      // Sidequest Action: Deliver Croissant Bribe
      if (state.storyFlags.hasBakeryCroissant && !state.storyFlags.bribedLokker) {
        options.push({
          label: '🥐 "Herr Lokker, ich habe Ihnen ein warmes Butter-Croissant von Oma Martha mitgebracht!"',
          en: 'Offer Croissant Bribe: Gift warm pastry from Bakery Hansa to soften landlord rules.',
          action: (game) => {
            game.state.storyFlags.bribedLokker = true;
            game.state.storyFlags.landlordConfirmationSigned = true;
            game.state.hasApartment = true;
            game.state.npcRelationships['NPC_LOKKER'] = 90;
            game.sfx.playSfx('success');
            game.ui.spawnFloatingText('🥐 Herr Lokker ist begeistert! Wohnungsgeberbestätigung erhalten! (Lokker +40)', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
            game.ui.updateQuestTracker();

            window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
              de: '*Schnuppert begeistert* ...Ein noch warmes Butter-Croissant von Martha?! Nun... man sieht, dass Sie Anstand und Kultur besitzen! Hier ist Ihre unterschriebene Wohnungsgeberbestätigung für das Bürgeramt!',
              en: '*Sniffs delightedly* ...A warm butter croissant from Martha?! Well... you clearly possess manners and culture! Here is your signed Wohnungsgeberbestätigung (Landlord Confirmation) for the Bürgeramt!',
              options: [{ label: '📜 "Vielen herzlichen Dank, Herr Lokker!"', en: 'Thank you very much, Mr. Lokker!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
            };
            game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
          }
        });
      }

      // House Rules & Trash Sorting Dilemma
      options.push({
        label: '🗑️ "Können Sie mir die genauen Müllregeln und Ruhezeiten erklären?"',
        en: 'Ask: "Please teach me the official German trash separation and quiet hour rules."',
        action: (game) => {
          game.state.storyFlags.separatedTrashCorrectly = true;
          game.state.npcRelationships['NPC_LOKKER'] = Math.min(100, game.state.npcRelationships['NPC_LOKKER'] + 15);
          window.FFH.NPC_DATABASE['NPC_LOKKER'].currentResponse = {
            de: 'Sehr vorbildlich! Erstens: Nachtruhe ab Punkt 22:00 Uhr. Zweitens: Mülltrennung ist Gesetz! Blaue Tonne = Papier/Pappe, Gelber Sack = Plastikverpackungen, Schwarze Tonne = Restmüll. Wer falsch trennt, zahlt die Nachsortiergebühr!',
            en: 'Exemplary! 1. Absolute quiet hours starting promptly at 22:00. 2. Waste sorting is law: Blue bin = Paper/Cardboard, Yellow bag = Packaging/Plastic, Black bin = Residual waste. Proper sorting avoids heavy fines!',
            options: [{ label: '👍 "Ich werde mich strikt daran halten!"', en: 'I will follow this strictly!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_LOKKER', custom: true });
        }
      });

      options.push({
        label: '🚪 "Einen schönen Tag, Herr Lokker!" (Leave)',
        en: 'Leave Dorm Entrance',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Herr Hans Lokker',
        de: 'Guten Tag. Denken Sie daran: Die Haustür bleibt stets abgeschlossen und im Flur stehen keine Schuhe!',
        en: 'Good day. Remember: The front entrance must remain locked and no shoes are to be left in the shared hallway!',
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

      // Survival Advice
      options.push({
        label: '💡 "Nico, wie überlebe ich die ersten 28 Tage in Deutschland?"',
        en: 'Ask: "Nico, what is the secret to surviving the first month in Germany?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            de: 'Drei goldene Regeln: 1. Mach sofort deine Anmeldung im Bürgeramt, sonst kannst du dein Bankkonto nicht eröffnen. 2. Arbeite Kruma-Schichten für die 250€ Semestergebühr. 3. Hol dir das Vokabel-Notizbuch im Zimmer!',
            en: 'Three golden rules: 1. Register at Bürgeramt immediately, or you cannot unlock your bank account. 2. Work Kruma shifts to pay the 250€ tuition. 3. Upgrade your Pocket Notepad in your room to ace German shifts!',
            options: [{ label: '🤝 "Danke, mein Freund!"', en: 'Thanks my friend!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      // Ventilation Lore
      options.push({
        label: '🪟 "Was hat es mit diesem \'Stoßlüften\' auf sich?"',
        en: 'Ask: "Why is everyone in Germany obsessed with \'Stoßlüften\' (Shock Ventilation)?"',
        action: (game) => {
          game.state.storyFlags.stosslueftenCount++;
          window.FFH.NPC_DATABASE['NPC_NICO'].currentResponse = {
            de: 'Stoßlüften ist in Deutschland fast eine Religion! Fenster 5 Minuten ganz weit aufreißen für kompletten Luftaustausch. Wenn du das nicht machst, droht Schimmel und Lokker steht vor deiner Tür!',
            en: 'Shock-ventilation is practically a national ritual! Open windows fully for 5 minutes twice daily to prevent moisture buildup. If you do not do it, Lokker will inspect your room for humidity!',
            options: [{ label: '🌬️ "Ich werde täglich lüften!"', en: 'I will ventilate daily!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_NICO', custom: true });
        }
      });

      options.push({
        label: '🚪 "Bis später, Nico!"',
        en: 'Goodbye, Nico!',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      return {
        speaker: 'Nico',
        de: 'Moin! Wir halten als internationale Studenten zusammen. Lass dich von den Formularen nicht entmutigen!',
        en: 'Hey! We international students look out for each other. Don\'t let the German bureaucracy intimidate you!',
        options: options
      };
    }
  },

  // 7. HERR VOGEL (Rathaus Bürgeramt Official)
  'NPC_VOGEL': {
    id: 'NPC_VOGEL',
    name: 'Herr Vogel',
    title: 'Bürgeramt Sachbearbeiter',
    building: 'B_RATHAUS',
    greetingAudio: 'guten_tag',
    avatarColor: '#1D3557',
    personality: {
      type: 'Peak Amtsschimmel',
      likes: 'Official forms, landlord signatures, neat folders.',
      dislikes: 'Missing paperwork, unbooked walk-ins.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_VOGEL'] || [];
      const addMemory = (tag) => { if (!memories.includes(tag)) memories.push(tag); };
      addMemory('met_vogel');

      // Successful Registration Flow
      if (!state.hasAnmeldung && (state.hasApartment || state.storyFlags.landlordConfirmationSigned)) {
        return {
          speaker: 'Herr Vogel (Bürgeramt)',
          de: 'Guten Tag. Nummer B-104? Bitte treten Sie vor. Haben Sie Ihren Pass und die Wohnungsgeberbestätigung des Vermieters dabei?',
          en: 'Good day. Ticket B-104? Please step forward. Do you have your passport and the official landlord confirmation (Wohnungsgeberbestätigung)?',
          options: [
            {
              label: '📑 "Ja! Hier ist die Bestätigung von Herrn Lokker und mein Pass!" (Complete Anmeldung)',
              en: 'Submit landlord confirmation to register municipal residence',
              action: (game) => {
                game.state.hasAnmeldung = true;
                game.state.inventory.push('meldebescheinigung');
                game.state.npcRelationships['NPC_VOGEL'] = 100;
                game.sfx.playSfx('success');
                game.ui.spawnFloatingText('📑 Anmeldung erfolgreich! Meldebescheinigung erhalten!', window.innerWidth / 2, window.innerHeight / 2, '#1D3557');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
                  de: '*DOPPEL-STEMPEL MIT RATSKSIEGEL!* Ausgezeichnet. Sie sind nun offiziell mit Wohnsitz in Lübeck gemeldet! Hier ist Ihre Meldebescheinigung. Gehen Sie damit zur Sparkasse, um Ihr Sperrkonto zu aktivieren!',
                  en: '*DOUBLE STAMP WITH CITY CREST!* Excellent. You are officially registered in the municipal register of Lübeck! Take this certificate to Sparkasse Bank to unfreeze your blocked account!',
                  options: [{ label: '🏦 "Vielen Dank, Herr Vogel!"', en: 'Thank you very much, Mr. Vogel!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Bureaucratic Trivia
      options.push({
        label: '💬 "Warum ist die \'Wohnungsgeberbestätigung\' in Deutschland so wichtig?"',
        en: 'Ask: "Why is the landlord confirmation so strictly enforced in Germany?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_VOGEL'].currentResponse = {
            de: 'Nach § 19 des Bundesmeldegesetzes muss jeder Vermieter den Einzug schriftlich bestätigen, um Scheinanmeldungen zu verhindern. Ordnung muss sein!',
            en: 'Under Section 19 of the Federal Registration Act, every landlord must certify occupancy to prevent false registrations. Order is essential!',
            options: [{ label: '📜 "Sehr gründlich!"', en: 'Very thorough!', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_VOGEL', custom: true });
        }
      });

      options.push({
        label: '🚪 "Auf Wiedersehen, Herr Vogel!" (Leave)',
        en: 'Leave Bürgeramt',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let statusMsgDe = state.hasAnmeldung ? 
        'Ihre Meldebescheinigung ist ordnungsgemäß ausgestellt. Gehen Sie nun zur Sparkasse.' :
        'Ohne Wohnungsgeberbestätigung von Herrn Lokker kann ich Sie nicht anmelden! Bringen Sie das Formular mit.';
      let statusMsgEn = state.hasAnmeldung ?
        'Your registration certificate is already issued. Visit Sparkasse Bank next.' :
        'Without a landlord confirmation from Hans Lokker, you cannot register! Bring the form.';

      return {
        speaker: 'Herr Vogel (Bürgeramt)',
        de: statusMsgDe,
        en: statusMsgEn,
        options: options
      };
    }
  },

  // 8. FRAU WEBER (Sparkasse Bank Advisor)
  'NPC_WEBER': {
    id: 'NPC_WEBER',
    name: 'Frau Weber',
    title: 'Sparkasse Kundenberaterin',
    building: 'B_BANK',
    greetingAudio: 'guten_tag',
    avatarColor: '#E63946',
    personality: {
      type: 'Hyper-Methodical & Formal',
      likes: 'IBAN numbers, verified identities, clean bank accounts.',
      dislikes: 'Unverified cash, missing Meldebescheinigung.'
    },
    dialogue: (state) => {
      const memories = state.npcMemory['NPC_WEBER'] || [];
      const addMemory = (tag) => { if (!memories.includes(tag)) memories.push(tag); };
      addMemory('met_weber');

      // Unlocking Blocked Bank Account
      if (!state.isSperrkontoUnlocked && state.hasAnmeldung && state.isMatriculated) {
        return {
          speaker: 'Frau Weber (Sparkasse)',
          de: 'Guten Tag! Sie haben sowohl die Immatrikulationsbescheinigung der Universität als auch die Meldebescheinigung des Bürgeramts dabei. Sollen wir Ihr deutsches Girokonto eröffnen und das Sperrkonto freischalten?',
          en: 'Good day! You brought both your university enrollment and municipal registration certificate. Shall we activate your German checking account and unfreeze your monthly blocked account allowance?',
          options: [
            {
              label: '💳 "Ja, bitte eröffnen Sie mein Konto und überweisen Sie die erste Rate!"',
              en: 'Activate blocked account & receive first 50.00€ monthly disbursement',
              action: (game) => {
                game.state.isSperrkontoUnlocked = true;
                game.state.wallet = window.FFH.round2(game.state.wallet + 50);
                game.state.npcRelationships['NPC_WEBER'] = 100;
                game.sfx.playSfx('register');
                game.ui.spawnFloatingText('💳 Sperrkonto freigeschaltet! +50.00€ Monatsrate überwiesen!', window.innerWidth / 2, window.innerHeight / 2, '#4CAF50');
                game.ui.updateQuestTracker();

                window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
                  de: 'Ausgezeichnet! Ihr Girokonto ist nun aktiv. Die erste Monatsrate von 50.00€ wurde gutgeschrieben. Nun sind alle Ihre Unterlagen vollständig für den finalen Visumsantrag bei Frau Dr. Lindemann!',
                  en: 'Excellent! Your bank account is live and your first 50.00€ allowance is credited. All your documents are now complete to submit your final visa dossier to Dr. Lindemann!',
                  options: [{ label: '🏛️ "Ich gehe direkt zur Ausländerbehörde!"', en: 'I will head straight to immigration!', action: (g) => g.transitionTo('CITY_EXPLORATION') }]
                };
                game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
              }
            }
          ]
        };
      }

      const options = [];

      // Financial Lore
      options.push({
        label: '💬 "Wie funktioniert das deutsche Sperrkonto genau?"',
        en: 'Ask: "How does the German blocked account (Sperrkonto) work?"',
        action: (game) => {
          window.FFH.NPC_DATABASE['NPC_WEBER'].currentResponse = {
            de: 'Das Sperrkonto garantiert den deutschen Behörden, dass Sie während Ihres Studiums über ausreichende finanzielle Mittel verfügen. Jeden Monat wird automatisch ein Festbetrag auf Ihr Girokonto überwiesen.',
            en: 'The blocked account guarantees to immigration authorities that you have sufficient living funds. Every month, a fixed disbursement is automatically released to your checking account.',
            options: [{ label: '👍 "Sehr sicher und verlässlich."', en: 'Very secure and reliable.', action: (g) => g.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER' }) }]
          };
          game.transitionTo('DIALOGUE', { npcKey: 'NPC_WEBER', custom: true });
        }
      });

      options.push({
        label: '🚪 "Auf Wiedersehen, Frau Weber!" (Leave)',
        en: 'Leave Bank',
        action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
      });

      let statusMsgDe = state.isSperrkontoUnlocked ? 
        'Ihr deutsches Bankkonto ist aktiv und versorgt Sie mit monatlichen Auszahlungen.' :
        'Für die Freischaltung des Sperrkontos benötige ich Ihre Immatrikulation von der Uni und die Meldebescheinigung vom Bürgeramt.';
      let statusMsgEn = state.isSperrkontoUnlocked ?
        'Your German checking account is active with regular monthly payouts.' :
        'To unlock your Sperrkonto, I need your university enrollment certificate and municipal registration from the Bürgeramt.';

      return {
        speaker: 'Frau Weber (Sparkasse)',
        de: statusMsgDe,
        en: statusMsgEn,
        options: options
      };
    }
  },

  // 9. FRAU DR. LINDEMANN (Ausländerbehörde Immigration Boss & Finale)
  'NPC_LINDEMANN': {
    id: 'NPC_LINDEMANN',
    name: 'Frau Dr. Lindemann',
    title: 'Leiterin Ausländerbehörde',
    building: 'B_AUSLAENDER',
    greetingAudio: 'guten_tag',
    avatarColor: '#2B2D42',
    personality: {
      type: 'Stern but Fair Immigration Director',
      likes: 'Complete dossiers, motivated students, speaking German.',
      dislikes: 'Expired visas, missing documents, excuses.'
    },
    dialogue: (state) => {
      const hasAllDocuments = state.isMatriculated && (state.hasApartment || state.storyFlags.landlordConfirmationSigned) && state.hasAnmeldung && state.isSperrkontoUnlocked;

      if (hasAllDocuments) {
        return {
          speaker: 'Frau Dr. Lindemann (Ausländerbehörde)',
          de: 'Guten Tag. Ich prüfe Ihre Akte für die Erteilung des Aufenthaltstitels: Immatrikulationsbescheinigung? Vorhanden. Wohnungsgeberbestätigung? Vorhanden. Meldebescheinigung des Bürgeramts? Vorhanden. Sperrkonto-Aktivierung? Vorhanden! Sind Sie bereit für die offizielle Bewilligung Ihres Visums?',
          en: 'Good day. Inspecting your dossier for the official residence permit: University enrollment? Present. Landlord confirmation? Present. Municipal registration? Present. Blocked account activation? Present! Are you ready to receive your official German Student Visa?',
          options: [
            {
              label: '🎓 "Ja! Ich beantrage hiermit meinen offiziellen Aufenthaltstitel!" (Complete Game & Win!)',
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
      if (!state.isMatriculated) missingList.push('🎓 Immatrikulation (Universität)');
      if (!state.hasApartment && !state.storyFlags.landlordConfirmationSigned) missingList.push('🏠 Wohnungsgeberbestätigung (Herr Lokker)');
      if (!state.hasAnmeldung) missingList.push('📑 Meldebescheinigung (Bürgeramt)');
      if (!state.isSperrkontoUnlocked) missingList.push('💳 Sperrkonto-Freischaltung (Sparkasse)');

      return {
        speaker: 'Frau Dr. Lindemann (Ausländerbehörde)',
        de: `Guten Tag. Ihr 28-Tage-Visum läuft unerbittlich ab! In Ihrer Akte fehlen aktuell noch: ${missingList.join(', ')}. Gehen Sie den Hinweisen nach und vervollständigen Sie Ihre Dokumente!`,
        en: `Good day. Your 28-day visa countdown is running! Your dossier is still missing: ${missingList.join(', ')}. Complete all steps across the city before the deadline expires!`,
        options: [
          {
            label: '🏃 "Ich kümmere mich sofort um die fehlenden Nachweise!"',
            en: 'I will collect the missing documents immediately!',
            action: (game) => { game.transitionTo('CITY_EXPLORATION'); }
          }
        ]
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
        speaker: 'Kunde an der Haustür',
        audioKey: audioMap[state.currentShift] || 'delivery_1',
        de: scenario.questionDe,
        en: scenario.questionEn,
        options: scenario.choices.map(choice => ({
          label: `💬 "${choice.textDe}"`,
          en: choice.textEn,
          audioKey: choice.audioKey,
          action: (game) => {
            game.state.lastEtiquetteTipDelta = choice.tipDelta;
            game.ui.spawnFloatingText(choice.correct ? `Gut! ${choice.feedbackDe}` : `Ups! ${choice.feedbackDe}`, window.innerWidth / 2, window.innerHeight / 2, choice.correct ? '#4CAF50' : '#E63946');
            
            game.lastPayout = window.FFH.calculatePayout(game.state);
            game.transitionTo('DEBRIEF_RECEIPT');
          }
        }))
      };
    }
  }
};
