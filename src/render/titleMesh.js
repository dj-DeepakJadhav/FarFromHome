// 3D Blocky Volumetric Title Mesh Generator for "LÜBECK" matching the Messenger font art style
window.FFH = window.FFH || {};

window.FFH.createLuebeckTitleMesh = function() {
  const titleGroup = new THREE.Group();
  
  // Clean white material with subtle warm tone
  const titleMat = window.FFH.createCelMaterial(0xFBFBF8);
  const letterDepth = 0.85;

  // Grid bit-matrix font definition for 6 letters: L, Ü, B, E, C, K
  // 5 rows high, 3 columns wide (similar to the blocky reference art)
  const fontBitmaps = {
    'L': [
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,1,1]
    ],
    'Ü': [
      [1,0,1],
      [0,0,0],
      [1,0,1],
      [1,0,1],
      [1,1,1]
    ],
    'B': [
      [1,1,0],
      [1,0,1],
      [1,1,0],
      [1,0,1],
      [1,1,0]
    ],
    'E': [
      [1,1,1],
      [1,0,0],
      [1,1,0],
      [1,0,0],
      [1,1,1]
    ],
    'C': [
      [1,1,1],
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,1,1]
    ],
    'K': [
      [1,0,1],
      [1,1,0],
      [1,0,0],
      [1,1,0],
      [1,0,1]
    ]
  };

  const letters = ['L', 'Ü', 'B', 'E', 'C', 'K'];
  // Arrange in 2 rows of 3 letters matching the 3x3 reference layout:
  // Row 1: L  Ü  B
  // Row 2: E  C  K
  const blockGeo = new THREE.BoxGeometry(0.38, 0.38, letterDepth);

  letters.forEach((char, idx) => {
    const charGroup = new THREE.Group();
    const matrix = fontBitmaps[char] || fontBitmaps['L'];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (matrix[r][c] === 1) {
          const cube = new THREE.Mesh(blockGeo, titleMat);
          cube.position.set((c - 1) * 0.4, (2 - r) * 0.4, 0);
          cube.castShadow = true;
          cube.receiveShadow = true;
          charGroup.add(cube);
        }
      }
    }

    // Grid placement: Row 0 (top), Row 1 (bottom)
    const col = idx % 3;
    const row = Math.floor(idx / 3);

    const posX = (col - 1) * 1.8;
    const posY = (0.5 - row) * 2.5;

    charGroup.position.set(posX, posY, 0);
    titleGroup.add(charGroup);
  });

  return titleGroup;
};
