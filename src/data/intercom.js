// Doorstep buzzer boards.
//
// Generated per shift rather than listed, because shifts repeat indefinitely.
// The surnames stay German - that is setting, not a vocabulary test. Floor
// labels are plain English so the puzzle is "find the name", not "translate".

window.FFH.RESIDENT_NAMES = [
  'Schmidt', 'Muller', 'Weber', 'Fischer', 'Wagner', 'Becker',
  'Hoffmann', 'Schafer', 'Koch', 'Bauer', 'Richter', 'Klein',
  'Wolf', 'Neumann', 'Zimmer', 'Braun'
];

window.FFH.FLOOR_LABELS = [
  'Ground Floor L', 'Ground Floor R',
  '1st Floor L', '1st Floor R',
  '2nd Floor L', '2nd Floor R',
  '3rd Floor L', '3rd Floor R',
  'Rear House 1st', 'Rear House 2nd'
];

window.FFH.shuffled = function (source) {
  const arr = source.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

// n is 1-based. Board grows from 4 to 10 nameplates as shifts escalate.
window.FFH.getIntercom = function (n) {
  const count = Math.min(10, 4 + Math.floor(n / 2) * 2);

  const names = window.FFH.shuffled(window.FFH.RESIDENT_NAMES).slice(0, count);
  const floors = window.FFH.shuffled(window.FFH.FLOOR_LABELS).slice(0, count);

  const residents = names.map((name, i) => ({ name: name, floor: floors[i] }));
  const correctBuzzerIndex = Math.floor(Math.random() * count);

  return {
    shift: n,
    residents: residents,
    correctBuzzerIndex: correctBuzzerIndex,
    target: residents[correctBuzzerIndex],
    floorCode: residents[correctBuzzerIndex].floor
  };
};
