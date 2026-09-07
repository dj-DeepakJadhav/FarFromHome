// Equipment and Room Furnishing Upgrades.
//
// Buying upgrades both improves delivery mechanics and visibly furnishes
// the student sublet room (the genre's visible growth readout).
window.FFH.shopUpgrades = [
  {
    id: 'ebike',
    nameEn: 'E-Bike',
    cost: 45,
    effectEn: '-40% transit time; less road time means fresher cargo',
    icon: '⚡',
    poiLocation: 'B_PIZZA',
    locationName: 'Fahrrad Shop & Pizzeria Bella'
  },
  {
    id: 'thermalBag',
    nameEn: 'Thermal Bag',
    cost: 50,
    effectEn: 'Halves freshness decay while riding',
    icon: '🎒',
    poiLocation: 'B_PIZZA',
    locationName: 'Fahrrad Shop & Pizzeria Bella'
  },
  {
    id: 'shelfLabels',
    nameEn: 'Shelf Labels',
    cost: 25,
    effectEn: 'Stamps the tier symbol (▲●■) on every item, not just the rail',
    icon: '🏷️',
    poiLocation: 'B_DARKSTORE',
    locationName: 'Kruma Express Hub'
  },
  {
    id: 'pocketNotepad',
    nameEn: 'Pocket Notepad',
    cost: 20,
    effectEn: 'One free rail re-pulse per shift when you lose the thread',
    icon: '📋',
    poiLocation: 'B_RATHAUS',
    locationName: 'Stationery & Town Hall (Rathaus)'
  },
  {
    id: 'vocabCards',
    nameEn: 'Shift Rota Cards',
    cost: 35,
    effectEn: '-0.8s icon delay, +25% early-pick bonus',
    icon: '🎴',
    poiLocation: 'B_RATHAUS',
    locationName: 'Stationery & Town Hall (Rathaus)'
  }
];
