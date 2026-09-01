// Doorstep Customer Hand-off Scenarios with Cultural Etiquette and Emotional Resonance
window.FFH.dialogue = [
  {
    shift: 1,
    customer: 'Nico (Hostel Roommate)',
    questionEn: 'How do you greet your jetlagged hostel buddy Nico?',
    questionDe: 'Wie begrüßt du deinen Mitbewohner Nico?',
    choices: [
      {
        textEn: 'Hey Nico! Hot breakfast is here—let\'s conquer day one!',
        textDe: 'Hey Nico! Warmes Frühstück ist da—packen wir Tag eins an!',
        audioKey: 'guten_tag',
        correct: true,
        feedbackEn: 'Nico smiles with relief and splits his coffee budget with you! (+5.00€ Tip)',
        feedbackDe: 'Nico lächelt erleichtert und teilt sein Kaffeegeld mit dir! (+5.00€)',
        tipDelta: 5
      },
      {
        textEn: 'Here is your order. That will be fifteen euros.',
        textDe: 'Hier ist deine Bestellung. Das macht 15 Euro.',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'A bit cold for a hostel buddy. Nico tips standard change. (+1.00€ Tip)',
        feedbackDe: 'Etwas kühl für einen Zimmergenossen. (+1.00€)',
        tipDelta: 1
      }
    ]
  },
  {
    shift: 2,
    customer: 'Oma Martha (Bakery Hansa)',
    questionEn: 'Oma Martha opens the door covered in flour. How do you hand over the ingredients?',
    questionDe: 'Wie übergibst du die Backzutaten an Oma Martha?',
    choices: [
      {
        textEn: 'Good morning, Frau Webber! Fresh flour and butter to save your Franzbrötchen batch!',
        textDe: 'Guten Morgen, Frau Webber! Frisches Mehl und Butter für Ihre Franzbrötchen!',
        audioKey: 'danke_schoen',
        correct: true,
        feedbackEn: 'Martha beams with joy, hands you a warm pastry, and gives a generous tip! (+12.00€ Tip)',
        feedbackDe: 'Martha strahlt vor Freude und schenkt dir ein warmes Gebäck! (+12.00€)',
        tipDelta: 12
      },
      {
        textEn: 'Yo Martha, got your baking stuff here.',
        textDe: 'Hi Martha, hier sind deine Backsachen.',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'Martha raises an eyebrow at the casual greeting. (-3.00€ Tip)',
        feedbackDe: 'Martha schaut streng über den Brillenrand. (-3.00€)',
        tipDelta: -3
      }
    ]
  },
  {
    shift: 3,
    customer: 'Hans Lokker (WG Dorm Caretaker)',
    questionEn: 'Hans Lokker checks his wristwatch at 21:55 before quiet hours. How do you deliver the flat party groceries?',
    questionDe: 'Wie übergibst du die Party-Lieferung an Herrn Lokker?',
    choices: [
      {
        textEn: 'Good evening, Herr Lokker. Delivered before 22:00 quiet hours, fully intact!',
        textDe: 'Guten Abend, Herr Lokker. Pünktlich vor der 22:00 Uhr Ruhezeit geliefert!',
        audioKey: 'guten_tag',
        correct: true,
        feedbackEn: 'Lokker nods approvingly at your German punctuality! (+15.00€ Tip)',
        feedbackDe: 'Lokker nickt anerkennend über deine Pünktlichkeit! (+15.00€)',
        tipDelta: 15
      },
      {
        textEn: 'What\'s up Hans! The party is starting early tonight!',
        textDe: 'Was geht Hans! Die Party geht schon los!',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'Lokker glares and writes a noise warning note. (-6.00€ Tip)',
        feedbackDe: 'Lokker runzelt die Stirn und notiert eine Mahnung. (-6.00€)',
        tipDelta: -6
      }
    ]
  },
  {
    shift: 4,
    customer: 'Herr Vogel (Rathaus Bürgeramt)',
    questionEn: 'Herr Vogel is surrounded by tall stacks of registration folders. How do you deliver his coffee and cheese?',
    questionDe: 'Wie übergibst du die Verpflegung an Herrn Vogel?',
    choices: [
      {
        textEn: 'Good day, Herr Vogel. Hot coffee and sustenance for your stamping duty!',
        textDe: 'Guten Tag, Herr Vogel. Heißer Kaffee und Stärkung für Ihren Dienst!',
        audioKey: 'danke_schoen',
        correct: true,
        feedbackEn: 'Herr Vogel sighs happily and slides a generous tip across the desk! (+18.00€ Tip)',
        feedbackDe: 'Herr Vogel seufzt erleichtert und gibt ein großzügiges Trinkgeld! (+18.00€)',
        tipDelta: 18
      },
      {
        textEn: 'Here is your drink, dude.',
        textDe: 'Hier ist dein Getränk, Kollege.',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'Herr Vogel adjusts his glasses in bureaucratic disapproval. (-4.00€ Tip)',
        feedbackDe: 'Herr Vogel rückt die Brille missbilligend zurecht. (-4.00€)',
        tipDelta: -4
      }
    ]
  },
  {
    shift: 5,
    customer: 'Mathias Becker (Hansa Rad Mechanic)',
    questionEn: 'Mathias wiped grease from his hands with a towel. How do you deliver his lunch?',
    questionDe: 'Wie übergibst du das Mittagessen an Mathias?',
    choices: [
      {
        textEn: 'Hot lunch for the master mechanic! Hope the bike repairs are flying!',
        textDe: 'Heißes Mittagessen für den Meister! Hoffe die Reparaturen laufen!',
        audioKey: 'guten_tag',
        correct: true,
        feedbackEn: 'Mathias laughs heartily and gives you a brotherly mechanic\'s tip! (+20.00€ Tip)',
        feedbackDe: 'Mathias lacht herzlich und gibt dir ein brüderliches Trinkgeld! (+20.00€)',
        tipDelta: 20
      },
      {
        textEn: 'You should fix bikes faster so I can deliver faster.',
        textDe: 'Du solltest Räder schneller reparieren.',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'Mathias grumbles in Italian and offers no extra tip. (+0.00€ Tip)',
        feedbackDe: 'Mathias murmelt etwas auf Italienisch. (+0.00€)',
        tipDelta: 0
      }
    ]
  },
  {
    shift: 6,
    customer: 'Frau Weber (Sparkasse Bank Advisor)',
    questionEn: 'Frau Weber is reviewing financial audit records. How do you present the bank team\'s lunch order?',
    questionDe: 'Wie übergibst du das Essen an Frau Weber?',
    choices: [
      {
        textEn: 'Good afternoon, Frau Weber. Punctual delivery with receipt enclosed for accounting!',
        textDe: 'Guten Tag, Frau Weber. Pünktlich geliefert mit Quittung für die Buchhaltung!',
        audioKey: 'danke_schoen',
        correct: true,
        feedbackEn: 'Frau Weber smiles at your professionalism and gives an official bank tip! (+22.00€ Tip)',
        feedbackDe: 'Frau Weber lobt deine Professionalität und gewährt Spitzen-Trinkgeld! (+22.00€)',
        tipDelta: 22
      },
      {
        textEn: 'Here\'s the food. Enjoy.',
        textDe: 'Hier ist das Essen. Guten Appetit.',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'Standard corporate delivery reception. (+5.00€ Tip)',
        feedbackDe: 'Standard-Empfang ohne Sonderbonus. (+5.00€)',
        tipDelta: 5
      }
    ]
  },
  {
    shift: 7,
    customer: 'Dr. Lindemann (Immigration Office Director)',
    questionEn: 'Dr. Lindemann is preparing the final visa decisions of the week. How do you deliver the express order?',
    questionDe: 'Wie übergibst du die Express-Lieferung an Dr. Lindemann?',
    choices: [
      {
        textEn: 'Good evening, Dr. Lindemann. Express courier delivery fulfilled with highest diligence!',
        textDe: 'Guten Abend, Frau Dr. Lindemann. Express-Lieferung mit höchster Sorgfalt ausgeführt!',
        audioKey: 'guten_tag',
        correct: true,
        feedbackEn: 'Dr. Lindemann breaks into a rare warm smile and awards a VIP courier bonus! (+30.00€ Tip)',
        feedbackDe: 'Dr. Lindemann lächelt warmherzig und vergibt einen VIP-Bonus! (+30.00€)',
        tipDelta: 30
      },
      {
        textEn: 'Kruma delivery is here.',
        textDe: 'Kruma Lieferung ist da.',
        audioKey: 'doorbell_wrong',
        correct: false,
        feedbackEn: 'Polite but formal reception. (+8.00€ Tip)',
        feedbackDe: 'Höflicher, aber distanzierter Empfang. (+8.00€)',
        tipDelta: 8
      }
    ]
  }
];
