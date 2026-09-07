// Real ink-outline post-processing: renders a view-space normal + depth pass,
// then Sobel-detects discontinuities in both and paints dark lines over the
// normal render. This is what gives the hand-inked comic look (the existing)// INK_OUTLINE ShaderMaterial only fakes a rim darkening per-surface and cannot
// produce actual silhouette or crease lines.
window.FFH = window.FFH || {};

const OUTLINE_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    tNormal: { value: null },
    tDepth: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uThickness: { value: 1.15 },
    uNormalThreshold: { value: 0.45 },
    uDepthThreshold: { value: 0.0022 },
    uLineColor: { value: new THREE.Color(0x21262b) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform vec2 uResolution;
    uniform float uThickness;
    uniform float uNormalThreshold;
    uniform float uDepthThreshold;
    uniform vec3 uLineColor;
    varying vec2 vUv;

    void main() {
      vec2 texel = uThickness / uResolution;
      vec3 base = texture2D(tDiffuse, vUv).rgb;

      // Sobel-ish 4-tap cross on view normals: catches creases between
      // differently-facing faces AND silhouettes against the sky.
      vec3 n0 = texture2D(tNormal, vUv).rgb;
      vec3 nR = texture2D(tNormal, vUv + vec2(texel.x, 0.0)).rgb;
      vec3 nL = texture2D(tNormal, vUv - vec2(texel.x, 0.0)).rgb;
      vec3 nU = texture2D(tNormal, vUv + vec2(0.0, texel.y)).rgb;
      vec3 nD = texture2D(tNormal, vUv - vec2(0.0, texel.y)).rgb;
      float normalDelta = length(nR - n0) + length(nL - n0) + length(nU - n0) + length(nD - n0);

      // Same cross on depth: catches overlaps where two surfaces face the
      // same way but sit at different distances (one building in front of
      // another), which the normal test alone would miss.
      float d0 = texture2D(tDepth, vUv).x;
      float dR = texture2D(tDepth, vUv + vec2(texel.x, 0.0)).x;
      float dL = texture2D(tDepth, vUv - vec2(texel.x, 0.0)).x;
      float dU = texture2D(tDepth, vUv + vec2(0.0, texel.y)).x;
      float dD = texture2D(tDepth, vUv - vec2(0.0, texel.y)).x;
      float depthDelta = abs(dR - d0) + abs(dL - d0) + abs(dU - d0) + abs(dD - d0);

      // Anti-aliased smoothstep edge detection eliminates high-frequency pixel crawling and flicker
      float edgeN = smoothstep(uNormalThreshold, uNormalThreshold + 0.22, normalDelta);
      float edgeD = smoothstep(uDepthThreshold, uDepthThreshold * 2.8, depthDelta);
      float edge = clamp(max(edgeN, edgeD), 0.0, 1.0);

      gl_FragColor = vec4(mix(base, uLineColor, edge * 0.88), 1.0);
    }
  `,
};

window.FFH.createInkRenderer = function (renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const pr = renderer.getPixelRatio();
  const w = Math.max(1, Math.floor(size.width * pr));
  const h = Math.max(1, Math.floor(size.height * pr));

  // High precision depth texture (UnsignedIntType) to avoid 16-bit depth quantization flicker
  const normalTarget = new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
  });
  normalTarget.depthTexture = new THREE.DepthTexture(w, h);
  normalTarget.depthTexture.type = (typeof THREE.UnsignedIntType !== 'undefined') ? THREE.UnsignedIntType : THREE.UnsignedShortType;

  const normalMaterial = new THREE.MeshNormalMaterial();

  const composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  const outlinePass = new THREE.ShaderPass(OUTLINE_SHADER);
  outlinePass.uniforms.tNormal.value = normalTarget.texture;
  outlinePass.uniforms.tDepth.value = normalTarget.depthTexture;
  outlinePass.uniforms.uResolution.value = new THREE.Vector2(w, h);
  outlinePass.renderToScreen = true;
  composer.addPass(outlinePass);

  return {
    composer,
    renderPass,
    outlinePass,
    normalTarget,
    setCamera(cam) {
      this.renderPass.camera = cam;
      this._camera = cam;
    },
    _camera: camera,
    render() {
      const cam = this._camera;

      const prevOverride = scene.overrideMaterial;
      scene.overrideMaterial = normalMaterial;
      renderer.setRenderTarget(normalTarget);
      renderer.clear();
      renderer.render(scene, cam);
      scene.overrideMaterial = prevOverride;
      renderer.setRenderTarget(null);

      // Pass 2+3: normal color render, then the outline composite
      composer.render();
    },
    dispose() {
      normalTarget.dispose();
      if (normalTarget.depthTexture) normalTarget.depthTexture.dispose();
      normalMaterial.dispose();
    },
  };
};
