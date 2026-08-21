// Etiquette scenario dialogue flows (German vs English UI structures)
window.FFH.dialogue = [
  {
    shift: 1,
    questionDe: 'Wie begrüßen Sie den Kunden?',
    questionEn: 'How do you greet the customer at the door?',
    choices: [
      {
        textDe: 'Hallo! Hier ist deine Kruma Lieferung.',
        textEn: 'Hello! Here is your Kruma delivery. (Informal "Du")',
        correct: false,
        feedbackDe: 'Zu informell für eine Standard-Wohnung. Tipp gemindert (-2€).',
        feedbackEn: 'A bit too informal for standard residents. Tip reduced (-2€).',
        tipDelta: -2
      },
      {
        textDe: 'Guten Tag, Herr Müller. Ihre Lieferung von Kruma.',
        textEn: 'Good day, Mr. Müller. Your delivery from Kruma. (Formal "Sie")',
        correct: true,
        feedbackDe: 'Perfekte Etikette! Volles Trinkgeld gewährt.',
        feedbackEn: 'Perfect etiquette! Full tip granted.',
        tipDelta: 10
      }
    ]
  },
  {
    shift: 2,
    questionDe: 'Wie reagieren Sie auf die Verspätung?',
    questionEn: 'How do you address the slight delay?',
    choices: [
      {
        textDe: 'Entschuldigen Sie bitte die Verspätung. Guten Appetit!',
        textEn: 'Please excuse the delay. Enjoy your meal! (Formal)',
        correct: true,
        feedbackDe: 'Höflichkeit zahlt sich aus. Volles Trinkgeld!',
        feedbackEn: 'Politeness pays off. Full tip!',
        tipDelta: 15
      },
      {
        textDe: 'Hier ist das Essen. Sorry für die Verspätung.',
        textEn: 'Here is the food. Sorry for the delay. (Casual)',
        correct: false,
        feedbackDe: 'Kunde wünscht formellere Entschuldigung (-5€).',
        feedbackEn: 'Resident wanted a more formal apology (-5€).',
        tipDelta: -5
      }
    ]
  },
  {
    shift: 3,
    questionDe: 'Das Krankenhaus verlangt formelle Übergabe:',
    questionEn: 'The hospital ward requires formal handoff:',
    choices: [
      {
        textDe: 'Hallo, hier Kruma. Wer kriegt das Essen?',
        textEn: 'Hi, Kruma here. Who gets the food? (Informal)',
        correct: false,
        feedbackDe: 'Krankenpfleger reagieren genervt (-8€).',
        feedbackEn: 'Hospital staff react annoyed (-8€).',
        tipDelta: -8
      },
      {
        textDe: 'Guten Abend. Ich bringe die bestellte Lieferung für Station 3.',
        textEn: 'Good evening. I bring the ordered delivery for Ward 3. (Formal)',
        correct: true,
        feedbackDe: 'Großartig! Der Nachtzuschlag wird erhöht (+20€).',
        feedbackEn: 'Great! Night premium tip granted (+20€).',
        tipDelta: 20
      }
    ]
  }
];
