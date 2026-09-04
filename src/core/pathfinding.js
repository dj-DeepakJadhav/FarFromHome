// High-Performance A* Grid Pathfinding Engine for Far From Home
// Handles obstacle avoidance around buildings, water, and static structures
window.FFH = window.FFH || {};

window.FFH.isTileWalkable = function(gx, gz) {
  const S = window.FFH.MAP_SIZE || 24;
  const grid = window.FFH.LUBECK_CITY_GRID;
  if (!grid || gx < 0 || gx >= S || gz < 0 || gz >= S) return false;
  
  const type = grid[gz][gx];
  // Water, buildings, and trees are UNWALKABLE obstacles
  if (type === 'W' || type === 'T' || type.startsWith('A') || type.startsWith('B_')) {
    return false;
  }
  return true;
};

window.FFH.getTileCost = function(gx, gz) {
  const grid = window.FFH.LUBECK_CITY_GRID;
  if (!grid || !grid[gz] || !grid[gz][gx]) return 1.0;
  
  const type = grid[gz][gx];
  if (type === 'R_B') return 0.8;  // Bike lane (fastest path!)
  if (type === 'R_C' || type === 'BR' || type === 'R_R') return 1.0; // Cobblestone / Bridge
  if (type === 'G') return 1.2;    // Sidewalk / Grass
  return 1.0;
};

// Finds nearest walkable tile if target is inside an obstacle (e.g. building POI)
window.FFH.findNearestWalkableTile = function(gx, gz) {
  const S = window.FFH.MAP_SIZE || 24;
  if (window.FFH.isTileWalkable(gx, gz)) return { gx, gz };

  // Spiral search out up to radius 3
  for (let r = 1; r <= 3; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
        const nx = gx + dx;
        const nz = gz + dz;
        if (nx >= 0 && nx < S && nz >= 0 && nz < S && window.FFH.isTileWalkable(nx, nz)) {
          return { gx: nx, gz: nz };
        }
      }
    }
  }
  return { gx, gz };
};

// A* Grid Pathfinding algorithm returning array of 3D world waypoints
window.FFH.findPath = function(startX, startZ, targetX, targetZ) {
  const S = window.FFH.MAP_SIZE || 24;
  const TILE_SCALE = window.FFH.TILE_SCALE || 2.6;

  // Convert 3D world positions to grid coordinates
  let startNode = { gx: Math.round(startX / TILE_SCALE), gz: Math.round(startZ / TILE_SCALE) };
  let targetNode = { gx: Math.round(targetX / TILE_SCALE), gz: Math.round(targetZ / TILE_SCALE) };

  // Clamp to map bounds
  startNode.gx = Math.max(0, Math.min(S - 1, startNode.gx));
  startNode.gz = Math.max(0, Math.min(S - 1, startNode.gz));
  targetNode.gx = Math.max(0, Math.min(S - 1, targetNode.gx));
  targetNode.gz = Math.max(0, Math.min(S - 1, targetNode.gz));

  // If start or target is inside an obstacle, find nearest walkable tile
  startNode = window.FFH.findNearestWalkableTile(startNode.gx, startNode.gz);
  targetNode = window.FFH.findNearestWalkableTile(targetNode.gx, targetNode.gz);

  if (startNode.gx === targetNode.gx && startNode.gz === targetNode.gz) {
    return [{ x: targetX, z: targetZ }];
  }

  const key = (x, z) => `${x},${z}`;
  const heuristic = (a, b) => {
    const dx = Math.abs(a.gx - b.gx);
    const dz = Math.abs(a.gz - b.gz);
    return dx + dz + (1.4142 - 2) * Math.min(dx, dz);
  };

  const openSet = [];
  const closedSet = new Set();
  const cameFrom = new Map();

  const gScore = new Map();
  const fScore = new Map();

  const startKey = key(startNode.gx, startNode.gz);
  const targetKey = key(targetNode.gx, targetNode.gz);

  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startNode, targetNode));

  openSet.push({ gx: startNode.gx, gz: startNode.gz, f: fScore.get(startKey) });

  // 8-directional neighbor offsets
  const neighbors = [
    { dx: 0, dz: 1, dist: 1.0 },
    { dx: 0, dz: -1, dist: 1.0 },
    { dx: 1, dz: 0, dist: 1.0 },
    { dx: -1, dz: 0, dist: 1.0 },
    { dx: 1, dz: 1, dist: 1.414 },
    { dx: -1, dz: 1, dist: 1.414 },
    { dx: 1, dz: -1, dist: 1.414 },
    { dx: -1, dz: -1, dist: 1.414 }
  ];

  let iterations = 0;
  const maxIterations = 600;

  while (openSet.length > 0 && iterations++ < maxIterations) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const currKey = key(current.gx, current.gz);

    if (current.gx === targetNode.gx && current.gz === targetNode.gz) {
      const gridPath = [];
      let curr = currKey;
      while (cameFrom.has(curr)) {
        const [x, z] = curr.split(',').map(Number);
        gridPath.unshift({ gx: x, gz: z });
        curr = cameFrom.get(curr);
      }
      gridPath.unshift({ gx: startNode.gx, gz: startNode.gz });

      // Convert grid path to smoothed 3D world waypoints
      const worldPath = gridPath.map(node => ({
        x: node.gx * TILE_SCALE,
        z: node.gz * TILE_SCALE
      }));

      if (worldPath.length > 0) {
        worldPath[worldPath.length - 1] = { x: targetX, z: targetZ };
      }
      return worldPath;
    }

    closedSet.add(currKey);

    for (const n of neighbors) {
      const nx = current.gx + n.dx;
      const nz = current.gz + n.dz;
      const nKey = key(nx, nz);

      if (closedSet.has(nKey)) continue;
      if (!window.FFH.isTileWalkable(nx, nz)) continue;

      // Prevent diagonal cutting through corner obstacles
      if (n.dx !== 0 && n.dz !== 0) {
        if (!window.FFH.isTileWalkable(current.gx + n.dx, current.gz) ||
            !window.FFH.isTileWalkable(current.gx, current.gz + n.dz)) {
          continue;
        }
      }

      const stepCost = n.dist * window.FFH.getTileCost(nx, nz);
      const tentativeG = gScore.get(currKey) + stepCost;

      if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
        cameFrom.set(nKey, currKey);
        gScore.set(nKey, tentativeG);
        const fVal = tentativeG + heuristic({ gx: nx, gz: nz }, targetNode);
        fScore.set(nKey, fVal);

        const openIdx = openSet.findIndex(item => item.gx === nx && item.gz === nz);
        if (openIdx >= 0) {
          openSet[openIdx].f = fVal;
        } else {
          openSet.push({ gx: nx, gz: nz, f: fVal });
        }
      }
    }
  }

  // Fallback direct path if target unreachable
  return [{ x: targetX, z: targetZ }];
};
