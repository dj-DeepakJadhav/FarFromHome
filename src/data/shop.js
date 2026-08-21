// Equipment and Room Furnishing Upgrades.
//
// Buying upgrades both improves delivery mechanics and visibly furnishes
// the student sublet room (the genre's visible growth readout).
window.FFH.shopUpgrades = [
  {
    id: 'ebike',
    nameEn: 'E-Bike',
    cost: 45,
    category: 'equipment',
    effectEn: 'Cuts travel time by 40%. Less road time means fresher deliveries.',
    icon: '⚡'
  },
  {
    id: 'insulatedBag',
    nameEn: 'Thermal Courier Bag',
    cost: 50,
    category: 'equipment',
    effectEn: 'Halves freshness decay while riding.',
    icon: '🎒'
  },
  {
    id: 'desk_lamp',
    nameEn: 'Study Desk & Lamp',
    cost: 25,
    category: 'furniture',
    effectEn: 'Furnishes your room. Boosts student study focus (+2s Pick time limit).',
    icon: '🛋️'
  },
  {
    id: 'cozy_rug',
    nameEn: 'Warm Bohemian Rug',
    cost: 20,
    category: 'furniture',
    effectEn: 'Cozy floor covering. Adds warmth to your bare room.',
    icon: '🧶'
  },
  {
    id: 'cube_pet_cat',
    nameEn: 'Companion Cat',
    cost: 35,
    category: 'pet',
    effectEn: 'A sweet companion that sits on your bed (+5% tip bonus on deliveries).',
    icon: '🐱'
  }
];
