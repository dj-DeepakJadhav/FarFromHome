// Doorstep Customer Hand-off Scenarios with Cultural Etiquette, Emotional Depth & Personality Heuristics
window.FFH.dialogue = [
  {
    shift: 1,
    customer: 'Nico (Hostel Roommate & Fellow Expat)',
    questionEn: 'Nico is sitting on a cardboard box, holding an unactivated foreign SIM card. How do you greet your roommate?',
    questionDe: 'Wie begrüßt du deinen Mitbewohner Nico?',
    choices: [
      {
        textEn: 'Hey Nico! Hot breakfast is here. Don\'t lose hope, we\'ll conquer this city together, one shift at a time.',
        textDe: 'Hey Nico! Warmes Frühstück ist da. Kopf hoch, wir schaffen das hier zusammen!',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Nico smiles with tears in his eyes, shares his instant coffee, and leaves a warm tip! (+6.00€ Tip | +Diplomat)',
        feedbackDe: 'Nico lächelt gerührt und teilt sein Kaffeegeld mit dir! (+6.00€)',
        tipDelta: 6
      },
      {
        textEn: 'Fast delivery! Here is your breakfast. Eat quickly, I have two more orders in the bag!',
        textDe: 'Schnelle Lieferung! Hier ist dein Essen. Ich muss direkt weiter!',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'hustler',
        feedbackEn: 'Nico respects the courier hustle! (+3.00€ Tip | +Hustler)',
        feedbackDe: 'Nico respektiert deinen Eifer! (+3.00€)',
        tipDelta: 3
      },
      {
        textEn: 'Here is your order. That will be fifteen euros exact. Keep your receipt for tax deduction.',
        textDe: 'Hier ist deine Bestellung. Das macht 15 Euro. Quittung für die Steuer aufbewahren.',
        audioKey: 'doorbell_wrong',
        correct: false,
        disposition: 'bureaucrat',
        feedbackEn: 'A bit bureaucratic for a roommate! Nico tips standard change. (+1.00€ Tip | +Bureaucrat)',
        feedbackDe: 'Etwas formal für einen Zimmergenossen. (+1.00€)',
        tipDelta: 1
      }
    ]
  },
  {
    shift: 2,
    customer: 'Oma Martha (Bakery Hansa)',
    questionEn: 'Oma Martha opens her kitchen door covered in flour, smiling through post-war memories. How do you deliver the baking supplies?',
    questionDe: 'Wie übergibst du die Backzutaten an Oma Martha?',
    choices: [
      {
        textEn: 'Guten Morgen, Frau Beck! Fresh organic flour and butter to save your famous Franzbrötchen batch!',
        textDe: 'Guten Morgen, Frau Beck! Frisches Mehl und Butter für Ihre Franzbrötchen!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Martha beams with joy, hands you a warm butter croissant for landlord Lokker, and tips generously! (+12.00€ Tip | +Diplomat)',
        feedbackDe: 'Martha strahlt vor Freude und schenkt dir ein warmes Croissant! (+12.00€)',
        tipDelta: 12
      },
      {
        textEn: 'Express delivery from Kruma! Beat the morning rush hour by four minutes!',
        textDe: 'Kruma Expresslieferung! Vier Minuten vor der Stoßzeit da!',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'hustler',
        feedbackEn: 'Martha chuckles at your youthful energy! (+8.00€ Tip | +Hustler)',
        feedbackDe: 'Martha schmunzelt über deine Energie! (+8.00€)',
        tipDelta: 8
      },
      {
        textEn: 'Yo Martha, dropped off your heavy baking sack.',
        textDe: 'Hi Martha, hier ist dein Sack Mehl.',
        audioKey: 'doorbell_wrong',
        correct: false,
        disposition: 'hustler',
        feedbackEn: 'Martha raises an eyebrow at the casual greeting without proper title. (-3.00€ Tip)',
        feedbackDe: 'Martha schaut streng über den Brillenrand. (-3.00€)',
        tipDelta: -3
      }
    ]
  },
  {
    shift: 3,
    customer: 'Hans Lokker (WG Dorm Caretaker)',
    questionEn: 'Hans Lokker checks his mechanical watch at 21:55 on the doorstep. How do you hand over the groceries?',
    questionDe: 'Wie übergibst du die Lieferung an Herrn Lokker?',
    choices: [
      {
        textEn: 'Good evening, Herr Lokker. Delivered at 21:55, strictly respecting the 22:00 Ruhezeit and quiet hallways!',
        textDe: 'Guten Abend, Herr Lokker. Pünktlich um 21:55 Uhr, vor der 22:00 Uhr Ruhezeit geliefert!',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'bureaucrat',
        feedbackEn: 'Lokker nods with deep approval at your German punctuality and rule compliance! (+15.00€ Tip | +Bureaucrat)',
        feedbackDe: 'Lokker nickt anerkennend über deine Pünktlichkeit! (+15.00€)',
        tipDelta: 15
      },
      {
        textEn: 'Evening Herr Lokker! Brought the warm groceries and a fresh bakery treat from Oma Martha!',
        textDe: 'Guten Abend Herr Lokker! Warme Lebensmittel und ein Gebäck von Oma Martha!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Lokker softens at the mention of Martha. He mentions his late wife Anna and tips warmly! (+10.00€ Tip | +Diplomat)',
        feedbackDe: 'Lokker erinnert sich an seine verstorbene Frau Anna und gibt Trinkgeld! (+10.00€)',
        tipDelta: 10
      },
      {
        textEn: 'What\'s up Hans! Turn up the stereo, the weekend is here!',
        textDe: 'Was geht Hans! Musik an, das Wochenende ist da!',
        audioKey: 'doorbell_wrong',
        correct: false,
        disposition: 'hustler',
        feedbackEn: 'Lokker scowls and threatens to report noise to the housing board! (-6.00€ Tip)',
        feedbackDe: 'Lokker runzelt wütend die Stirn. (-6.00€)',
        tipDelta: -6
      }
    ]
  },
  {
    shift: 4,
    customer: 'Mathias Becker (Pizzeria Napoletana)',
    questionEn: 'Mathias offers you an off-the-books cash envelope (Schwarzarbeit) for late-night pizzeria deliveries. How do you respond?',
    questionDe: 'Wie reagierst du auf Mathias\' Angebot für Barzahlung ohne Rechnung?',
    choices: [
      {
        textEn: 'I appreciate the offer Mathias, but I must stay within my legal 20h student visa quota. Let\'s keep it strictly by the book.',
        textDe: 'Danke Mathias, aber ich muss mich an meine 20h-Studentenquote halten. Bitte mit Quittung.',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'bureaucrat',
        feedbackEn: 'Mathias respects your discipline and integrity. He gives you an official food discount voucher! (+10.00€ Tip | +Bureaucrat)',
        feedbackDe: 'Mathias respektiert deine Disziplin und Ehrlichkeit! (+10.00€)',
        tipDelta: 10
      },
      {
        textEn: 'I need to reach my 250€ tuition goal tonight! Hand me the cash envelope and let\'s ride!',
        textDe: 'Ich brauche die 250€ Studiengebühr heute! Gib mir den Umschlag!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'hustler',
        feedbackEn: 'Mathias slips you 20.00€ cash in hand! But your Zoll inspection risk increases slightly. (+20.00€ Cash | +Hustler)',
        feedbackDe: 'Mathias gibt dir 20.00€ bar auf die Hand! (+20.00€)',
        tipDelta: 20
      },
      {
        textEn: 'Mathias, your pizza is the best in the Altstadt. Let me help you set up the terrace tables instead!',
        textDe: 'Mathias, deine Pizza ist die beste! Lass mich dir lieber auf der Terrasse helfen!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Mathias smiles warmly and packs a piping hot calzone for your evening shift! (+14.00€ Tip | +Diplomat)',
        feedbackDe: 'Mathias schenkt dir eine heiße Calzone! (+14.00€)',
        tipDelta: 14
      }
    ]
  },
  {
    shift: 5,
    customer: 'Dr. Anke Schmidt (AStA Student Rights Advocate)',
    questionEn: 'Dr. Anke Schmidt audits your courier hours while receiving her office tea order. How do you discuss your working conditions?',
    questionDe: 'Wie besprichst du deine Arbeitsbedingungen mit Dr. Schmidt?',
    choices: [
      {
        textEn: 'I meticulously track my weekly hours in my student notepad to comply with §16b AufenthG regulations.',
        textDe: 'Ich dokumentiere meine Wochenstunden genau nach §16b AufenthG.',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'bureaucrat',
        feedbackEn: 'Dr. Schmidt is impressed by your legal acumen and grants you an AStA legal orientation voucher! (+15.00€ Tip | +Bureaucrat)',
        feedbackDe: 'Dr. Schmidt ist beeindruckt von deinem Rechtswissen! (+15.00€)',
        tipDelta: 15
      },
      {
        textEn: 'Every shift is hard on wet cobblestones, but solidarity between student riders keeps our spirits high!',
        textDe: 'Die Schichten sind hart, aber die Solidarität unter den Fahrern hält uns aufrecht!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Dr. Schmidt smiles warmly and writes a student advocacy recommendation note! (+12.00€ Tip | +Diplomat)',
        feedbackDe: 'Dr. Schmidt lobt deine Haltung und gibt Trinkgeld! (+12.00€)',
        tipDelta: 12
      },
      {
        textEn: 'Hours don\'t matter, only the speed of the pedals and the cash in the pocket!',
        textDe: 'Stunden sind egal, Hauptsache das Tempo stimmt und das Geld fließt!',
        audioKey: 'doorbell_wrong',
        correct: false,
        disposition: 'hustler',
        feedbackEn: 'Dr. Schmidt frowns and warns you against exploitative labor practices. (+2.00€ Tip | +Hustler)',
        feedbackDe: 'Dr. Schmidt mahnt zur Vorsicht vor Ausbeutung. (+2.00€)',
        tipDelta: 2
      }
    ]
  },
  {
    shift: 6,
    customer: 'Klaus "Der Blitz" (Veteran Courier Rival)',
    questionEn: 'Klaus challenges you at the courier drop point on the Holstenstraße cobblestones. How do you conclude your delivery race?',
    questionDe: 'Wie begegnest du Klaus "Der Blitz" am Lieferziel?',
    choices: [
      {
        textEn: 'Fastest time on the Hanseatic bricks today! Perfect drift around St. Mary\'s cathedral corner!',
        textDe: 'Tagesbestzeit auf dem Kopfsteinpflaster! Perfekter Drift um die Marienkirche!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'hustler',
        feedbackEn: 'Klaus gives a high-five and shares veteran courier shortcuts! (+15.00€ Tip | +Hustler)',
        feedbackDe: 'Klaus gibt dir ein High-Five und verrät Abkürzungen! (+15.00€)',
        tipDelta: 15
      },
      {
        textEn: 'Speed is great Klaus, but zero damaged packages and polite door greetings keep our ratings at 5 stars!',
        textDe: 'Tempo ist gut Klaus, aber unbeschädigte Pakete bringen echte 5-Sterne-Bewertungen!',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Klaus nods with professional respect: "A true courier of culture." (+12.00€ Tip | +Diplomat)',
        feedbackDe: 'Klaus nickt respektvoll: "Ein echter Kurier mit Stil." (+12.00€)',
        tipDelta: 12
      },
      {
        textEn: 'I maintained the statutory municipal speed limit of 25 km/h for cyclist safety.',
        textDe: 'Ich habe mich stets an die innerörtliche Richtgeschwindigkeit gehalten.',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'bureaucrat',
        feedbackEn: 'Klaus laughs heartily: "You should work at the transport ministry!" (+8.00€ Tip | +Bureaucrat)',
        feedbackDe: 'Klaus lacht: "Du gehörst ins Verkehrsministerium!" (+8.00€)',
        tipDelta: 8
      }
    ]
  },
  {
    shift: 7,
    customer: 'Dr. Lindemann (Ausländerbehörde Immigration Director)',
    questionEn: 'Dr. Lindemann receives her diplomatic embassy tea order and reviews your presence in Lübeck. How do you address her?',
    questionDe: 'Wie triffst du auf die Ausländerbehörde-Leiterin Dr. Lindemann?',
    choices: [
      {
        textEn: 'Good evening, Frau Dr. Lindemann. Here is your order along with my complete 4-document dossier ready for audit.',
        textDe: 'Guten Abend, Frau Dr. Lindemann. Ihre Lieferung und mein vollständiges 4-Dokumente-Dossier!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'bureaucrat',
        feedbackEn: 'Dr. Lindemann is deeply impressed by your meticulous preparation and exemplary citizenship! (+25.00€ Tip | +Bureaucrat)',
        feedbackDe: 'Frau Dr. Lindemann ist tief beeindruckt von deinen Unterlagen! (+25.00€)',
        tipDelta: 25
      },
      {
        textEn: 'Good evening Frau Direktorin! I have worked hard, built friendships with every shopkeeper, and found a true home in Lübeck.',
        textDe: 'Guten Abend Frau Direktorin! Ich habe hart gearbeitet und hier in Lübeck ein echtes Zuhause gefunden.',
        audioKey: 'guten_tag',
        correct: true,
        disposition: 'diplomat',
        feedbackEn: 'Dr. Lindemann smiles gently: "You are the kind of dedicated international student our city is proud to welcome." (+25.00€ Tip | +Diplomat)',
        feedbackDe: 'Dr. Lindemann lächelt: "Auf solche engagierten Studenten sind wir stolz." (+25.00€)',
        tipDelta: 25
      },
      {
        textEn: 'Delivered in record time across the whole city! I never missed a single customer deadline!',
        textDe: 'In Rekordzeit geliefert! Ich habe keine einzige Frist verpasst!',
        audioKey: 'danke_schoen',
        correct: true,
        disposition: 'hustler',
        feedbackEn: 'Dr. Lindemann nods: "Incredible tenacity and work ethic." (+20.00€ Tip | +Hustler)',
        feedbackDe: 'Dr. Lindemann nickt anerkennend über deine Arbeitsmoral! (+20.00€)',
        tipDelta: 20
      }
    ]
  }
];
