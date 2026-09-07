// Hand-authored curated town layout (loose inspiration from L)übeck's
// Altstadt shape (a river looping around three sides, one gate as the land
// approach), not real OSM data. See Docs/ for the approved reference layout.
window.FFH = window.FFH || {};

window.FFH.townLayout = {
  buildings: [
    { type: 'gate', name: 'Holstentor', x: -220, z: 0, rotationDeg: 90, k: 'landmark' },
    { type: 'darkstore', name: 'Kruma Express Dark Store #104', x: -120, z: 20, rotationDeg: 0, k: 'store' },
    { type: 'office', name: 'Kruma Dispatch Office', x: -120, z: -70, rotationDeg: 0, k: 'building' },
    { type: 'shop', name: 'Späti', x: 60, z: 70, rotationDeg: 180, k: 'shop' },
    { type: 'church', name: 'Lübecker Dom', x: 10, z: -170, rotationDeg: 0, k: 'landmark' },
    { type: 'hospital', name: 'Heiligen-Geist-Hospital', x: 10, z: 170, rotationDeg: 0, k: 'landmark' },
    { type: 'dorm', name: 'Student Dorm', x: 150, z: 0, rotationDeg: -90, k: 'building' },
    { type: 'harbor', name: 'Museumshafen', x: -170, z: -150, rotationDeg: 45, k: 'landmark' },
    { type: 'house', name: 'House 1', x: 70, z: -70, rotationDeg: 30, k: 'building' },
    { type: 'house', name: 'House 2', x: 150, z: -90, rotationDeg: -20, k: 'building' },
    { type: 'house', name: 'House 3', x: 150, z: 90, rotationDeg: 20, k: 'building' },
    { type: 'house', name: 'House 4', x: 70, z: 150, rotationDeg: -30, k: 'building' },
    { type: 'house', name: 'House 5', x: -60, z: 120, rotationDeg: 15, k: 'building' },
    { type: 'house', name: 'House 6', x: -190, z: 100, rotationDeg: -15, k: 'building' },
  ],
  plazas: [
    { name: 'Marktplatz', x: 0, z: 0, width: 70, depth: 70 },
  ],
  roads: [
    { points: [[-220, 0], [-120, 20], [0, 0]] },
    { points: [[-120, 20], [-120, -70]] },
    { points: [[0, 0], [10, -170]] },
    { points: [[0, 0], [10, 170]] },
    { points: [[0, 0], [150, 0]] },
    { points: [[0, 0], [60, 70]] },
    { points: [[-120, 20], [-170, -150]] },
  ],
  river: {
    points: [[-320, -280], [250, -280], [320, -200], [320, 200], [250, 280], [-320, 280]],
    width: 40,
  },
  // Explicit spawn coordinates ON the street, deliberately NOT the dark
  // store's own position (a building entry)'s x/z is its CENTRE, so spawning
  // there puts the character inside the walls (which is exactly what happened
  // the first time: the "sky" was the unlit interior of the store).
  // The dark store is 24x18 units, so this sits clear of its footprint while
  // still reading as "just outside work".
  playerStart: { x: -95, z: 14, nearBuilding: 'Kruma Express Dark Store #104' },
};
