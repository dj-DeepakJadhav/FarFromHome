// Defines the prologue story sequence
window.FFH = window.FFH || {};
window.FFH.prologueQuests = [
  {
    id: 'quest-uni',
    targetPoi: 'B_UNI',
    prompt: 'Target: Find the University to register.',
    completionMessage: 'Registered! Now you need a job to pay rent.'
  },
  {
    id: 'quest-cafe',
    targetPoi: 'B_PIZZA',
    prompt: 'Target: Ask for a job at the Pizzeria.',
    completionMessage: 'Pizzeria: "Not hiring. Try the Bakery."'
  },
  {
    id: 'quest-grocery',
    targetPoi: 'B_BAKERY',
    prompt: 'Target: Ask for a job at the Bakery.',
    completionMessage: 'Bakery: "No vacancies. Look for Kruma Express."'
  },
  {
    id: 'quest-kruma',
    targetPoi: 'B_DARKSTORE',
    prompt: 'Target: Find Kruma Express to get hired.',
    completionMessage: 'Hired! Welcome to Kruma Express.'
  }
];
