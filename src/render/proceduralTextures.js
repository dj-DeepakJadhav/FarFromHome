// Procedural Hand-Drawn Math Texture Generator with Mathematical Normal Maps
// Inspired by solo dev procedural systems (Project Tomorrow)
// Generates stylized, crisp textures & tangent-space normal maps on HTML5 2D canvases at runtime (0 KB bundle cost).
window.FFH = window.FFH || {};

window.FFH.ProceduralTextures = (function() {
  const _cache = {};

  function makeCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return { canvas, ctx };
  }

  function setupTexture(canvas, repeatX = 1, repeatY = 1) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    if (window.FFH.renderer && window.FFH.renderer.capabilities) {
      texture.anisotropy = Math.min(4, window.FFH.renderer.capabilities.getMaxAnisotropy());
    }
    texture.needsUpdate = true;
    return texture;
  }

  // Mathematical Central-Difference Tangent-Space Normal Map Generator
  // Converts a grayscale heightmap canvas into an RGB tangent-space normal map
  function createNormalMapFromHeight(heightCanvas, strength = 2.5, repeatX = 1, repeatY = 1) {
    const w = heightCanvas.width;
    const h = heightCanvas.height;
    const srcCtx = heightCanvas.getContext('2d');
    const srcData = srcCtx.getImageData(0, 0, w, h).data;

    const { canvas: normCanvas, ctx: normCtx } = makeCanvas(w, h);
    const dstImg = normCtx.createImageData(w, h);
    const dstData = dstImg.data;

    // Helper to sample height (normalized 0.0 - 1.0) with seamless toroidal wrapping
    const getHeight = (x, y) => {
      const wrapX = (x + w) % w;
      const wrapY = (y + h) % h;
      const idx = (wrapY * w + wrapX) * 4;
      return srcData[idx] / 255.0;
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Central differences: Sobel/central gradient
        const left = getHeight(x - 1, y);
        const right = getHeight(x + 1, y);
        const up = getHeight(x, y - 1);
        const down = getHeight(x, y + 1);

        const dx = (right - left) * strength;
        const dy = (down - up) * strength;
        const dz = 1.0;

        // Normalize (dx, dy, dz)
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;
        const nx = -dx / len;
        const ny = -dy / len;
        const nz = dz / len;

        // Tangent-space RGB encoding: [-1, 1] -> [0, 255]
        const outIdx = (y * w + x) * 4;
        dstData[outIdx]     = Math.floor((nx * 0.5 + 0.5) * 255);
        dstData[outIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        dstData[outIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        dstData[outIdx + 3] = 255;
      }
    }

    normCtx.putImageData(dstImg, 0, 0);
    return setupTexture(normCanvas, repeatX, repeatY);
  }

  function pseudoRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // 1. Procedural European Arched Cobblestones (Lighter, Warmer, Tactile with Normal Map)
  function createCobblestoneTextures() {
    if (_cache.cobble && _cache.cobbleNormal) {
      return { diffuse: _cache.cobble, normal: _cache.cobbleNormal };
    }

    const size = 512;
    const { canvas: diffCanvas, ctx: diffCtx } = makeCanvas(size, size);
    const { canvas: heightCanvas, ctx: heightCtx } = makeCanvas(size, size);

    // Warm, clean limestone mortar base
    diffCtx.fillStyle = '#636B77';
    diffCtx.fillRect(0, 0, size, size);

    // Heightmap mortar background is low/recessed
    heightCtx.fillStyle = '#181818';
    heightCtx.fillRect(0, 0, size, size);

    // Larger, authentic European pavers: 9 rows (prominent, beautiful cobblestones)
    const rows = 9;
    const rowHeight = size / rows;
    const stoneWidth = 54;

    // Lighter, warmer Hanseatic limestone and granite palette
    const stoneHues = [
      '#9EABB8', '#A8B4C2', '#B6C1CC', '#8F9CA9', '#C3CCD6',
      '#A2ADB9', '#B0BAC5', '#98A4B2', '#B9C4CE', '#A6B2BD'
    ];

    let seed = 77;

    for (let r = 0; r < rows + 2; r++) {
      const y = r * rowHeight - rowHeight * 0.5;
      const rowOffset = (r % 2 === 0) ? 0 : stoneWidth * 0.5;
      const archAmplitude = 5.0;

      for (let x = -stoneWidth; x < size + stoneWidth * 2; x += stoneWidth) {
        seed++;
        const archY = Math.sin((x / size) * Math.PI * 4) * archAmplitude;
        const stoneX = x + rowOffset + (pseudoRandom(seed) * 3 - 1.5);
        const stoneY = y + archY + (pseudoRandom(seed + 1) * 2 - 1);
        const w = stoneWidth - 6 + (pseudoRandom(seed + 2) * 4);
        const h = rowHeight - 6 + (pseudoRandom(seed + 3) * 3);
        const radius = 9;

        // Diffuse Paver
        const colorIdx = Math.floor(pseudoRandom(seed + 4) * stoneHues.length);
        diffCtx.fillStyle = stoneHues[colorIdx];
        diffCtx.beginPath();
        diffCtx.roundRect(stoneX, stoneY, w, h, radius);
        diffCtx.fill();

        // Top-left subtle highlight bevel
        diffCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        diffCtx.lineWidth = 2.2;
        diffCtx.beginPath();
        diffCtx.moveTo(stoneX + radius, stoneY + h - 3);
        diffCtx.lineTo(stoneX + radius, stoneY + radius);
        diffCtx.lineTo(stoneX + w - radius, stoneY + radius);
        diffCtx.stroke();

        // Bottom-right shadow bevel
        diffCtx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
        diffCtx.lineWidth = 2.2;
        diffCtx.beginPath();
        diffCtx.moveTo(stoneX + radius, stoneY + h - 1.5);
        diffCtx.lineTo(stoneX + w - radius, stoneY + h - 1.5);
        diffCtx.lineTo(stoneX + w - 1.5, stoneY + radius);
        diffCtx.stroke();

        // Heightmap Paver (convex dome gradient for rounded 3D cobblestones)
        const radGrad = heightCtx.createRadialGradient(
          stoneX + w * 0.5, stoneY + h * 0.45, 2,
          stoneX + w * 0.5, stoneY + h * 0.45, Math.max(w, h) * 0.55
        );
        radGrad.addColorStop(0, '#FFFFFF');
        radGrad.addColorStop(0.7, '#D4D4D4');
        radGrad.addColorStop(1, '#444444');

        heightCtx.fillStyle = radGrad;
        heightCtx.beginPath();
        heightCtx.roundRect(stoneX, stoneY, w, h, radius);
        heightCtx.fill();
      }
    }

    _cache.cobble = setupTexture(diffCanvas, 1, 1);
    _cache.cobbleNormal = createNormalMapFromHeight(heightCanvas, 3.2, 1, 1);
    return { diffuse: _cache.cobble, normal: _cache.cobbleNormal };
  }

  // 2. Historic European Pedestrian Promenade & Cycle Paving (Zero Cars, Zero Asphalt, Zero Highway Markings)
  function createGermanRoadTextures() {
    if (_cache.germanRoad && _cache.germanRoadNormal) {
      return { diffuse: _cache.germanRoad, normal: _cache.germanRoadNormal };
    }

    const size = 512;
    const { canvas: diffCanvas, ctx: diffCtx } = makeCanvas(size, size);
    const { canvas: heightCanvas, ctx: heightCtx } = makeCanvas(size, size);

    // Deep mortar base
    diffCtx.fillStyle = '#5A6270';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#1A1A1A';
    heightCtx.fillRect(0, 0, size, size);

    // Staggered paving flagstones (Pflasterstein Promenade)
    const rows = 8;
    const rowH = size / rows;
    const slabW = 64;
    const slabH = rowH - 4;

    const slabHues = [
      '#8F9AA8', '#9BA6B5', '#A5B0BF', '#8691A0',
      '#939EA8', '#A0ABC0', '#8D97A5', '#98A3B2'
    ];

    let seed = 129;
    for (let r = 0; r < rows; r++) {
      const y = r * rowH + 2;
      const rowOffset = (r % 2 === 0) ? 0 : slabW * 0.5;

      for (let x = -slabW; x < size + slabW; x += slabW) {
        seed++;
        const slabX = x + rowOffset + 2;
        const w = slabW - 4;
        const h = slabH;

        // Diffuse flagstone
        const colorIdx = Math.floor(pseudoRandom(seed) * slabHues.length);
        diffCtx.fillStyle = slabHues[colorIdx];
        diffCtx.beginPath();
        diffCtx.roundRect(slabX, y, w, h, 3);
        diffCtx.fill();

        // Subtle stone bevel highlight
        diffCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        diffCtx.lineWidth = 1.2;
        diffCtx.strokeRect(slabX + 1, y + 1, w - 2, h - 2);

        // Heightmap flagstone body (raised stone surface with soft bevel)
        const radGrad = heightCtx.createRadialGradient(
          slabX + w * 0.5, y + h * 0.5, 2,
          slabX + w * 0.5, y + h * 0.5, Math.max(w, h) * 0.6
        );
        radGrad.addColorStop(0, '#E0E0E0');
        radGrad.addColorStop(0.8, '#C4C4C4');
        radGrad.addColorStop(1, '#606060');

        heightCtx.fillStyle = radGrad;
        heightCtx.beginPath();
        heightCtx.roundRect(slabX, y, w, h, 3);
        heightCtx.fill();
      }
    }

    _cache.germanRoad = setupTexture(diffCanvas, 1, 1);
    _cache.germanRoadNormal = createNormalMapFromHeight(heightCanvas, 2.5, 1, 1);
    return { diffuse: _cache.germanRoad, normal: _cache.germanRoadNormal };
  }

  // 3. Procedural Hanseatic Brick Facades with Tangent-Space Normal Maps
  function createBrickFacadeTextures(variant = 0) {
    const key = `brick_${variant}`;
    const normKey = `brick_norm_${variant}`;
    if (_cache[key] && _cache[normKey]) {
      return { diffuse: _cache[key], normal: _cache[normKey] };
    }

    const size = 256;
    const { canvas: diffCanvas, ctx: diffCtx } = makeCanvas(size, size);
    const { canvas: heightCanvas, ctx: heightCtx } = makeCanvas(size, size);

    const palettes = [
      { base: '#B84A39', jitter: ['#C35645', '#AB3E2D', '#D16251', '#9E3324', '#B84A39'], mortar: '#E8E1D5' },
      { base: '#DE9B47', jitter: ['#E5A553', '#D4903D', '#EBB061', '#C68330', '#DE9B47'], mortar: '#EAE5DB' },
      { base: '#76997B', jitter: ['#80A485', '#6D9072', '#8CAF91', '#638568', '#76997B'], mortar: '#DFDFD6' },
      { base: '#D97768', jitter: ['#E08273', '#CF6D5E', '#E88F80', '#C36051', '#D97768'], mortar: '#ECE6DC' },
      { base: '#EAD7B7', jitter: ['#F0DEC0', '#E2CEAC', '#F6E5C8', '#D8C3A0', '#EAD7B7'], mortar: '#D6C8B2' },
      { base: '#7F1D1D', jitter: ['#8C2424', '#721717', '#992E2E', '#641111', '#7F1D1D'], mortar: '#D8CECE' }
    ];

    const pal = palettes[variant % palettes.length];

    // Mortar channels (recessed in heightmap)
    diffCtx.fillStyle = pal.mortar;
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#222222';
    heightCtx.fillRect(0, 0, size, size);

    const rows = 16;
    const rowH = size / rows;
    const brickW = 32;

    let seed = variant * 100 + 17;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offsetX = (r % 2 === 0) ? 0 : brickW * 0.5;

      for (let x = -brickW; x < size + brickW; x += brickW) {
        seed++;
        const bx = x + offsetX + 1;
        const by = y + 1;
        const bw = brickW - 2;
        const bh = rowH - 2;

        const colorIdx = Math.floor(pseudoRandom(seed) * pal.jitter.length);
        diffCtx.fillStyle = pal.jitter[colorIdx];
        diffCtx.fillRect(bx, by, bw, bh);

        // Brick top highlight
        diffCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        diffCtx.fillRect(bx, by, bw, 1.2);

        // Brick bottom shadow
        diffCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        diffCtx.fillRect(bx, by + bh - 1.2, bw, 1.2);

        // Heightmap brick body is raised
        heightCtx.fillStyle = '#E8E8E8';
        heightCtx.fillRect(bx, by, bw, bh);
      }
    }

    _cache[key] = setupTexture(diffCanvas, 2, 2);
    _cache[normKey] = createNormalMapFromHeight(heightCanvas, 2.5, 2, 2);
    return { diffuse: _cache[key], normal: _cache[normKey] };
  }

  // 4. Procedural Scalloped Terracotta Roof Tiles with Tangent-Space Normal Maps
  function createRoofTileTextures(roofType = 'terracotta') {
    const key = `roof_${roofType}`;
    const normKey = `roof_norm_${roofType}`;
    if (_cache[key] && _cache[normKey]) {
      return { diffuse: _cache[key], normal: _cache[normKey] };
    }

    const size = 256;
    const { canvas: diffCanvas, ctx: diffCtx } = makeCanvas(size, size);
    const { canvas: heightCanvas, ctx: heightCtx } = makeCanvas(size, size);

    const isCopper = (roofType === 'copper');
    const baseColor = isCopper ? '#3D7A68' : '#9E2A2B';
    const darkShade = isCopper ? '#285547' : '#771E1F';
    const highlight = isCopper ? '#559E87' : '#B83A3C';

    diffCtx.fillStyle = darkShade;
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#202020';
    heightCtx.fillRect(0, 0, size, size);

    const rows = 12;
    const rowH = size / rows;
    const tileW = 28;

    for (let r = 0; r < rows + 1; r++) {
      const y = r * rowH;
      const offsetX = (r % 2 === 0) ? 0 : tileW * 0.5;

      diffCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      diffCtx.fillRect(0, y, size, 3);

      for (let x = -tileW; x < size + tileW; x += tileW) {
        const tx = x + offsetX;
        const tw = tileW - 2;
        const th = rowH * 1.35;

        diffCtx.fillStyle = baseColor;
        diffCtx.beginPath();
        diffCtx.moveTo(tx, y);
        diffCtx.lineTo(tx + tw, y);
        diffCtx.lineTo(tx + tw, y + th - 8);
        diffCtx.quadraticCurveTo(tx + tw * 0.5, y + th + 4, tx, y + th - 8);
        diffCtx.closePath();
        diffCtx.fill();

        diffCtx.strokeStyle = highlight;
        diffCtx.lineWidth = 1.5;
        diffCtx.beginPath();
        diffCtx.moveTo(tx + 2, y + th - 7);
        diffCtx.quadraticCurveTo(tx + tw * 0.5, y + th + 2, tx + tw - 2, y + th - 7);
        diffCtx.stroke();

        // Shingle height slope: higher at bottom lip, lower at top tuck
        const shingleGrad = heightCtx.createLinearGradient(tx, y, tx, y + th);
        shingleGrad.addColorStop(0, '#555555');
        shingleGrad.addColorStop(0.85, '#EEEEEE');
        shingleGrad.addColorStop(1, '#FFFFFF');

        heightCtx.fillStyle = shingleGrad;
        heightCtx.beginPath();
        heightCtx.moveTo(tx, y);
        heightCtx.lineTo(tx + tw, y);
        heightCtx.lineTo(tx + tw, y + th - 8);
        heightCtx.quadraticCurveTo(tx + tw * 0.5, y + th + 4, tx, y + th - 8);
        heightCtx.closePath();
        heightCtx.fill();
      }
    }

    _cache[key] = setupTexture(diffCanvas, 2, 2);
    _cache[normKey] = createNormalMapFromHeight(heightCanvas, 3.0, 2, 2);
    return { diffuse: _cache[key], normal: _cache[normKey] };
  }

  // 5. Procedural Multi-Pane Window Texture
  function createWindowTexture() {
    if (_cache.window) return _cache.window;

    const size = 256;
    const { canvas, ctx } = makeCanvas(size, size);

    ctx.fillStyle = '#EDE5D8';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#9A8E7E';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    const pad = 16;
    const innerW = size - pad * 2;
    const innerH = size - pad * 2;

    ctx.fillStyle = '#3D2619';
    ctx.fillRect(pad - 2, pad - 2, innerW + 4, innerH + 4);

    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size * 0.6);
    grad.addColorStop(0, '#FFE8A3');
    grad.addColorStop(0.6, '#F6BD60');
    grad.addColorStop(1, '#DDA15E');
    ctx.fillStyle = grad;
    ctx.fillRect(pad, pad, innerW, innerH);

    ctx.strokeStyle = '#EDE5D8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(size / 2, pad);
    ctx.lineTo(size / 2, pad + innerH);
    ctx.stroke();

    const rowStep = innerH / 3;
    ctx.beginPath();
    ctx.moveTo(pad, pad + rowStep);
    ctx.lineTo(pad + innerW, pad + rowStep);
    ctx.moveTo(pad, pad + rowStep * 2);
    ctx.lineTo(pad + innerW, pad + rowStep * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(100, 60, 40, 0.28)';
    ctx.beginPath();
    ctx.arc(size / 2 - innerW * 0.25, pad, innerW * 0.22, 0, Math.PI);
    ctx.arc(size / 2 + innerW * 0.25, pad, innerW * 0.22, 0, Math.PI);
    ctx.fill();

    _cache.window = setupTexture(canvas, 1, 1);
    return _cache.window;
  }

  // 6. Procedural Granite Sidewalk Texture
  function createSidewalkTexture() {
    if (_cache.sidewalk) return _cache.sidewalk;

    const size = 256;
    const { canvas, ctx } = makeCanvas(size, size);

    ctx.fillStyle = '#424853';
    ctx.fillRect(0, 0, size, size);

    const cols = 4;
    const rows = 4;
    const slabW = size / cols;
    const slabH = size / rows;
    const slabColors = ['#9AA5B4', '#A8B2BF', '#8F9CA9', '#A2ACB9'];

    let s = 101;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        s++;
        const x = c * slabW + 1.5;
        const y = r * slabH + 1.5;
        const w = slabW - 3;
        const h = slabH - 3;

        ctx.fillStyle = slabColors[Math.floor(pseudoRandom(s) * slabColors.length)];
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      }
    }

    _cache.sidewalk = setupTexture(canvas, 2, 2);
    return _cache.sidewalk;
  }

  return {
    getCobblestoneTexture: () => createCobblestoneTextures().diffuse,
    getCobblestoneNormalMap: () => createCobblestoneTextures().normal,
    getGermanRoadTexture: () => createGermanRoadTextures().diffuse,
    getGermanRoadNormalMap: () => createGermanRoadTextures().normal,
    getBrickFacadeTexture: (variant) => createBrickFacadeTextures(variant).diffuse,
    getBrickFacadeNormalMap: (variant) => createBrickFacadeTextures(variant).normal,
    getRoofTileTexture: (type) => createRoofTileTextures(type).diffuse,
    getRoofTileNormalMap: (type) => createRoofTileTextures(type).normal,
    getWindowTexture: createWindowTexture,
    getSidewalkTexture: createSidewalkTexture,
    createNormalMapFromHeight: createNormalMapFromHeight
  };
})();
