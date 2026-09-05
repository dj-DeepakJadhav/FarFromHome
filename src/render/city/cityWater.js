// Continuous Single Water Plane Shader
window.FFH = window.FFH || {};

// Continuous Single Water Plane Shader: Stylized Cel Water
// Inspired by cortiz2894/stylized-components waterFloor:
// - Animated Voronoi F1 vs SmoothF1 cell caustics
// - FBM noise flow distortion
// - 3-stop cel-shaded color ramp (deep azure -> turquoise cyan -> crisp white foam caustics)
window.FFH.createSeamlessWaterPlane = function(width = 110, height = 110) {
  const waterGeo = new THREE.PlaneGeometry(width, height, 1, 1);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:           { value: 0 },
      uScale:          { value: 0.28 },
      uSmoothness:     { value: 0.46 },
      uEdgeThreshold:  { value: 0.09 },
      uEdgeSoftness:   { value: 0.08 },
      uFlowX:          { value: -0.32 }, // Flows from RIGHT (+X) to LEFT (-X)
      uFlowZ:          { value: -0.04 },
      uCellSpeed:      { value: 0.55 },
      uNoiseScale:     { value: 0.85 },
      uNoiseFlowSpeed: { value: 0.12 },
      uDistortAmount:  { value: 0.28 },
      uDeepColor:      { value: new THREE.Color(0x27A3D8) }, // Rich anime azure (#27a3d8)
      uMidColor:       { value: new THREE.Color(0x59C0E8) }, // Soft vibrant cyan (#59c0e8)
      uMidPos:         { value: 0.31 },
      uHighlight:      { value: new THREE.Color(0xFFFFFF) }, // Pure white caustics
      uOpacity:        { value: 0.96 },
      uDeepOpacity:    { value: 0.88 },
      uCamXZ:          { value: new THREE.Vector2(31.2, 31.2) },
      uFadeDistance:   { value: 400.0 },
      uFadeStrength:   { value: 1.2 }
    },
    vertexShader: `
      varying vec2 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos     = worldPos.xz;
        gl_Position   = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uScale;
      uniform float uSmoothness;
      uniform float uEdgeThreshold;
      uniform float uEdgeSoftness;
      uniform float uFlowX;
      uniform float uFlowZ;
      uniform float uCellSpeed;
      uniform float uNoiseScale;
      uniform float uNoiseFlowSpeed;
      uniform float uDistortAmount;
      uniform vec3  uDeepColor;
      uniform vec3  uMidColor;
      uniform float uMidPos;
      uniform vec3  uHighlight;
      uniform float uOpacity;
      uniform float uDeepOpacity;
      uniform float uFadeDistance;
      uniform float uFadeStrength;
      uniform vec2  uCamXZ;

      varying vec2 vWorldPos;

      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
      }

      float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * h * k / 6.0;
      }

      vec2 cellPt(vec2 seed) {
        return 0.5 + 0.5 * sin(uTime * uCellSpeed + 6.2831 * seed);
      }

      float voronoiF1(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        float md = 8.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 n  = vec2(float(x), float(y));
            vec2 pt = cellPt(hash2(i + n));
            md = min(md, length(n + pt - f));
          }
        }
        return md;
      }

      float voronoiSF1(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        float res = 8.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 n  = vec2(float(x), float(y));
            vec2 pt = cellPt(hash2(i + n));
            res = smin(res, length(n + pt - f), uSmoothness);
          }
        }
        return res;
      }

      float nHash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(nHash(i),                  nHash(i + vec2(1.0, 0.0)), f.x),
          mix(nHash(i + vec2(0.0, 1.0)), nHash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 2; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main() {
        // 1. Noise distortion
        vec2 noiseUV  = vWorldPos * uNoiseScale + vec2(uTime * uNoiseFlowSpeed, 0.0);
        float noiseFac = fbm(noiseUV);
        vec2 distort   = vec2(noiseFac - 0.5) * uDistortAmount;

        // 2. Voronoi UV: base river flow + noise distortion
        vec2 uv = vWorldPos * uScale + vec2(uFlowX, uFlowZ) * uTime + distort;

        float f1   = voronoiF1(uv);
        float sf1  = voronoiSF1(uv);

        // F1 − SmoothF1: 0 at cell centers → positive at cell boundaries
        float edge = f1 - sf1;

        // Cel-shaded ColorRamp: hard step at threshold
        float t = smoothstep(
          uEdgeThreshold - uEdgeSoftness,
          uEdgeThreshold + uEdgeSoftness,
          edge
        );

        // 3-stop ColorRamp: deepColor → midColor → highlight
        float safeMP = max(uMidPos, 1e-4);
        float seg0   = clamp(t / safeMP, 0.0, 1.0);
        float seg1   = clamp((t - safeMP) / max(1.0 - safeMP, 1e-4), 0.0, 1.0);
        float inSeg1 = step(safeMP, t);
        vec3 color   = mix(
          mix(uDeepColor, uMidColor, seg0),
          mix(uMidColor,  uHighlight, seg1),
          inSeg1
        );

        // Distance fade
        float dist = length(vWorldPos - uCamXZ);
        float fade = 1.0 - pow(clamp(dist / uFadeDistance, 0.0, 1.0), uFadeStrength);

        float alpha = mix(uDeepOpacity, 1.0, t) * uOpacity * fade;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(31.2, -0.22, 31.2);
  waterMesh.receiveShadow = true;
  return { waterMesh, waterMat };
};
