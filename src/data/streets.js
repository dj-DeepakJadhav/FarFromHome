// Configurations for shift streets: lane parameters, speed settings, navigation signs, and hazards
window.FFH.streets = [
  {
    shift: 1,
    speedBase: 4,
    freshnessDecay: 0.1,
    hazards: ['pothole'],
    junctionChance: 0.0,
    signs: []
  },
  {
    shift: 2,
    speedBase: 6,
    freshnessDecay: 0.15,
    hazards: ['pothole', 'cobble'],
    junctionChance: 0.2,
    signs: ['Hauptstraße', 'Einbahnstraße']
  },
  {
    shift: 3,
    speedBase: 7,
    freshnessDecay: 0.25,
    hazards: ['pothole', 'wet', 'cobble'],
    junctionChance: 0.35,
    signs: ['Hauptstraße', 'Einbahnstraße', 'Sackgasse']
  }
];
