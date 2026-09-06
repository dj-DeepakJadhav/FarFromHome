// Item catalogue. Each item carries the grammatical gender that decides
// which of the three warehouse shelf tiers it lives on.
window.FFH = window.FFH || {};

window.FFH.items = [
  // 1. Food & Grocery Tiers (Used in Warehouse & Bakery/Pizzeria Shifts)
  { id: 'milch', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Milch', pluralDe: 'Milch', nameEn: 'Milk', icon: '🥛', type: 'carton', category: 'Food', fragility: 'FRAGILE', audioKey: 'milch', exampleDe: 'Ich trinke die frische Milch.', exampleEn: 'I drink the fresh milk.' },
  { id: 'apfel', gender: 'der', color: '#3A86FF', hex: 0x3A86FF, nameDe: 'Apfel', pluralDe: 'Äpfel', nameEn: 'Apple', icon: '🍎', type: 'sphere', category: 'Food', fragility: 'STURDY', audioKey: 'apfel', exampleDe: 'Der rote Apfel ist knackig.', exampleEn: 'The red apple is crisp.' },
  { id: 'brot', gender: 'das', color: '#8338EC', hex: 0x8338EC, nameDe: 'Brot', pluralDe: 'Brote', nameEn: 'Bread', icon: '🍞', type: 'box', category: 'Food', fragility: 'STURDY', audioKey: 'brot', exampleDe: 'Das Sauerteigbrot duftet herrlich.', exampleEn: 'The sourdough bread smells wonderful.' },
  { id: 'wasser', gender: 'das', color: '#8338EC', hex: 0x8338EC, nameDe: 'Wasser', pluralDe: 'Wasser', nameEn: 'Water', icon: '💧', type: 'cylinder', category: 'Food', fragility: 'STURDY', audioKey: 'wasser', exampleDe: 'Das stille Wasser erfrischt.', exampleEn: 'The still water is refreshing.' },
  { id: 'banane', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Banane', pluralDe: 'Bananen', nameEn: 'Banana', icon: '🍌', type: 'curve', category: 'Food', fragility: 'PERISHABLE', audioKey: 'banane', exampleDe: 'Die gelbe Banane gibt Energie.', exampleEn: 'The yellow banana gives energy.' },
  { id: 'kaese', gender: 'der', color: '#3A86FF', hex: 0x3A86FF, nameDe: 'Käse', pluralDe: 'Käse', nameEn: 'Cheese', icon: '🧀', type: 'wedge', category: 'Food', fragility: 'PERISHABLE', audioKey: 'kaese', exampleDe: 'Der Käse schmilzt auf der Pizza.', exampleEn: 'The cheese melts on the pizza.' },
  { id: 'ei', gender: 'das', color: '#8338EC', hex: 0x8338EC, nameDe: 'Ei', pluralDe: 'Eier', nameEn: 'Egg', icon: '🥚', type: 'egg', category: 'Food', fragility: 'FRAGILE', audioKey: 'ei', exampleDe: 'Das Ei muss vorsichtig transportiert werden.', exampleEn: 'The egg must be transported carefully.' },
  { id: 'karotte', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Karotte', pluralDe: 'Karotten', nameEn: 'Carrot', icon: '🥕', type: 'cone', category: 'Food', fragility: 'STURDY', audioKey: 'karotte', exampleDe: 'Die Karotte ist gesund.', exampleEn: 'The carrot is healthy.' },
  { id: 'kaffee', gender: 'der', color: '#3A86FF', hex: 0x3A86FF, nameDe: 'Kaffee', pluralDe: 'Kaffees', nameEn: 'Coffee', icon: '☕', type: 'cylinder', category: 'Food', fragility: 'STURDY', audioKey: 'kaffee', exampleDe: 'Der heiße Kaffee weckt mich auf.', exampleEn: 'The hot coffee wakes me up.' },
  { id: 'pizza', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Pizza', pluralDe: 'Pizzen', nameEn: 'Pizza', icon: '🍕', type: 'box', category: 'Food', fragility: 'PERISHABLE', audioKey: 'pizza', exampleDe: 'Die Margherita Pizza ist heiß.', exampleEn: 'The Margherita pizza is hot.' },

  // 2. City & Courier Gear
  { id: 'fahrrad', gender: 'das', color: '#8338EC', hex: 0x8338EC, nameDe: 'Fahrrad', pluralDe: 'Fahrräder', nameEn: 'Bicycle', icon: '🚲', category: 'City', audioKey: 'fahrrad', exampleDe: 'Das Fahrrad fährt über Kopfsteinpflaster.', exampleEn: 'The bicycle rides over cobblestones.' },
  { id: 'tasche', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Tasche', pluralDe: 'Taschen', nameEn: 'Thermal Bag', icon: '🎒', category: 'City', audioKey: 'tasche', exampleDe: 'Die Thermotasche hält Essen warm.', exampleEn: 'The thermal bag keeps food warm.' },
  { id: 'strasse', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Straße', pluralDe: 'Straßen', nameEn: 'Street', icon: '🛣️', category: 'City', audioKey: 'strasse', exampleDe: 'Die Straße führt zum Holstentor.', exampleEn: 'The street leads to the Holsten Gate.' },
  { id: 'schluessel', gender: 'der', color: '#3A86FF', hex: 0x3A86FF, nameDe: 'Schlüssel', pluralDe: 'Schlüssel', nameEn: 'Key', icon: '🔑', category: 'City', audioKey: 'schluessel', exampleDe: 'Der Schlüssel öffnet die Haustür.', exampleEn: 'The key unlocks the front door.' },

  // 3. German Bureaucracy Terms (Amt & Universität)
  { id: 'stempel', gender: 'der', color: '#3A86FF', hex: 0x3A86FF, nameDe: 'Stempel', pluralDe: 'Stempel', nameEn: 'Official Stamp', icon: '📮', category: 'Bureaucracy', audioKey: 'stempel', exampleDe: 'Der rote Stempel besiegelt das Dokument.', exampleEn: 'The red stamp seals the document.' },
  { id: 'bescheinigung', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Bescheinigung', pluralDe: 'Bescheinigungen', nameEn: 'Certificate', icon: '📑', category: 'Bureaucracy', audioKey: 'bescheinigung', exampleDe: 'Die Meldebescheinigung ist Pflicht.', exampleEn: 'The registration certificate is mandatory.' },
  { id: 'visum', gender: 'das', color: '#8338EC', hex: 0x8338EC, nameDe: 'Visum', pluralDe: 'Visa', nameEn: 'Visa', icon: '🛂', category: 'Bureaucracy', audioKey: 'visum', exampleDe: 'Das 28-Tage-Visum läuft bald ab.', exampleEn: 'The 28-day visa expires soon.' },
  { id: 'mietvertrag', gender: 'der', color: '#3A86FF', hex: 0x3A86FF, nameDe: 'Mietvertrag', pluralDe: 'Mietverträge', nameEn: 'Lease Agreement', icon: '📜', category: 'Bureaucracy', audioKey: 'mietvertrag', exampleDe: 'Der Mietvertrag wird von Hans Lokker unterschrieben.', exampleEn: 'The lease agreement is signed by Hans Lokker.' },
  { id: 'konto', gender: 'das', color: '#8338EC', hex: 0x8338EC, nameDe: 'Konto', pluralDe: 'Konten', nameEn: 'Bank Account (Sperrkonto)', icon: '💳', category: 'Bureaucracy', audioKey: 'konto', exampleDe: 'Das Sperrkonto sichert den Lebensunterhalt.', exampleEn: 'The blocked account secures living expenses.' },
  { id: 'ruhezeit', gender: 'die', color: '#FF006E', hex: 0xFF006E, nameDe: 'Ruhezeit', pluralDe: 'Ruhezeiten', nameEn: 'Quiet Hours (22:00+)', icon: '🌙', category: 'Culture', audioKey: 'ruhezeit', exampleDe: 'Die Ruhezeit beginnt pünktlich um 22:00 Uhr.', exampleEn: 'Quiet hours begin promptly at 22:00.' }
];

