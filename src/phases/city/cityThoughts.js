// Ambient Location-Based Wanderer Thoughts
window.FFH = window.FFH || {};

window.FFH.checkWandererThoughts = function(px, pz, timeSec, lastThoughtTime, visitedZones, ui) {
  if (timeSec - (lastThoughtTime || 0) < 18.0) return lastThoughtTime;

  const thoughts = [
    {
      id: 'canal_bridge',
      condition: () => (pz > 10 && pz < 13) || (pz > 47 && pz < 50),
      text: "Look at this river. So flat it looks like someone ironed it with heavy starch. I bet even the fish swim in strict single file."
    },
    {
      id: 'blocky_crowd',
      condition: () => Math.hypot(px - 16.0, pz - 20.0) < 5.5,
      text: "Everyone here walks in exact right angles like toy soldiers. Don't look suspicious, mate. Look like you pay taxes."
    },
    {
      id: 'holstentor',
      condition: () => Math.hypot(px - 18.2, pz - 33.8) < 6.0,
      text: "Holstentor... built in 1464. Looks like two giant brick salt shakers guarding the road."
    },
    {
      id: 'forest_edge',
      condition: () => px < 8 || px > 54 || pz < 8 || pz > 54,
      text: "The local trees are so square and disciplined, they probably file quarterly foliage reports."
    },
    {
      id: 'bakery',
      condition: () => Math.hypot(px - 5.2, pz - 18.2) < 5.0,
      text: "Smells like warm cinnamon and sugar... though Oma Martha's rolling pin looks like a lethal weapon."
    },
    {
      id: 'uni',
      condition: () => Math.hypot(px - 54.6, pz - 33.8) < 5.0,
      text: "Universität Lübeck. €250 tuition fee. If I don't pay by Friday, my student life ends before it even begins."
    },
    {
      id: 'darkstore',
      condition: () => Math.hypot(px - 5.2, pz - 46.8) < 5.0,
      text: "Kruma Express. Where German nouns have genders and couriers sprint for rent money."
    }
  ];

  for (const t of thoughts) {
    if (!visitedZones.has(t.id) && t.condition()) {
      visitedZones.add(t.id);
      if (ui && ui.spawnWandererThought) {
        ui.spawnWandererThought(t.text);
      }
      return timeSec;
    }
  }
  return lastThoughtTime;
};
