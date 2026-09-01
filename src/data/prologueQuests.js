// Multi-branching Main Story & Side Quests for Far From Home
window.FFH = window.FFH || {};

window.FFH.prologueQuests = [
  {
    id: 'quest-0-arrival',
    targetPoi: 'B_UNI',
    title: 'Kapitel 1: Das 28-Tage-Visum (Chapter 1: The 28-Day Visa)',
    prompt: 'Find Rita Schneider at the University to inspect your enrollment status.',
    completionMessage: 'Rita needs your 250.00€ Semesterbeitrag! Go find work.'
  },
  {
    id: 'quest-1-hostel-dilemma',
    targetPoi: 'B_WG',
    title: 'Kapitel 2: Die Hausordnung (Chapter 2: The House Rules)',
    prompt: 'Meet Caretaker Hans Lokker at the WG Dorm to negotiate your student room.',
    completionMessage: 'Lokker demands strict 22:00 quiet hours and clean trash sorting.'
  },
  {
    id: 'quest-2-pizzeria-hustle',
    targetPoi: 'B_PIZZA',
    title: 'Kapitel 3: Der Pizzateig-Streit (Chapter 3: Pizzeria Feud)',
    prompt: 'Visit Mathias Becker at the Pizzeria to ask for work or advice.',
    completionMessage: 'Mathias warns you about delivery bikes and points you to Bakery Hansa.'
  },
  {
    id: 'quest-3-bakery-diplomacy',
    targetPoi: 'B_BAKERY',
    title: 'Kapitel 4: Oma Marthas Rat (Chapter 4: Oma Martha\'s Secret)',
    prompt: 'Speak with Oma Martha at the Bakery to get food and courier contacts.',
    completionMessage: 'Martha offers warm croissants and tells you Nina at Kruma is hiring urgently!'
  },
  {
    id: 'quest-4-kruma-hired',
    targetPoi: 'B_DARKSTORE',
    title: 'Kapitel 5: Die erste Schicht (Chapter 5: The First Shift)',
    prompt: 'Head to Kruma Express to start your first courier shift with Nina.',
    completionMessage: 'Hired! Sort items by German gender (der/die/das) to earn rent money.'
  },
  {
    id: 'quest-5-buergeramt-anmeldung',
    targetPoi: 'B_RATHAUS',
    title: 'Kapitel 6: Der Amtsschimmel (Chapter 6: Bureaucracy Gauntlet)',
    prompt: 'Take your landlord certificate to Herr Vogel at Bürgeramt for your Anmeldung.',
    completionMessage: 'Meldebescheinigung approved! Now you can unfreeze your blocked account.'
  },
  {
    id: 'quest-6-sparkasse-sperrkonto',
    targetPoi: 'B_BANK',
    title: 'Kapitel 7: Das Sperrkonto (Chapter 7: Blocked Bank Account)',
    prompt: 'Visit Frau Weber at Sparkasse Bank to activate your German bank account.',
    completionMessage: 'Sperrkonto unlocked! First 50€ monthly allowance disbursed.'
  },
  {
    id: 'quest-7-visa-finale',
    targetPoi: 'B_AUSLAENDER',
    title: 'Finale: Der Aufenthaltstitel (Final Chapter: Permanent Visa)',
    prompt: 'Present your completed dossier to Dr. Lindemann at the Ausländerbehörde!',
    completionMessage: 'Permanent Student Visa Granted! You survived German student immigration!'
  }
];

// Interactive Sidequests that trigger through character dialogue loops
window.FFH.sideQuests = [
  {
    id: 'side_croissant_bribe',
    title: 'Oma Marthas Friedensangebot (Martha\'s Croissant Peace Bribe)',
    desc: 'Buy a fresh croissant (2€) from Bakery Hansa and deliver it to Herr Lokker to soften his strict noise rules.',
    reward: 'Herr Lokker relationship +30, unlocks Landlord confirmation early'
  },
  {
    id: 'side_trash_mastery',
    title: 'Die Kunst der Mülltrennung (Mastering German Trash Sorting)',
    desc: 'Learn the German color-coded waste bins from Nico and Lokker (Blue = Paper, Yellow = Plastic, Black = Rest).',
    reward: 'Avoids 50€ landlord penalties and unlocks room upgrade discounts'
  },
  {
    id: 'side_stosslueften',
    title: 'Stoßlüften Experte (Shock-Ventilation Mastery)',
    desc: 'Perform proper 5-minute German window shock ventilation in your room.',
    reward: 'Health +20, Roommate respect +25'
  },
  {
    id: 'side_pizzeria_truce',
    title: 'Der Pizzeria-Waffenstillstand (Pizzeria Truce)',
    desc: 'Park your courier bicycle across the street to stop blocking Mathias\'s terrace tables.',
    reward: 'Herr Mathias gives 20% discount on hot pizzas (+Freshness bonus)'
  }
];
