// Multi-Shader Material System with Real-Time Style Swapping
window.FFH = window.FFH || {};

// Available Shader Styles:
// 1. 'CEL_3BAND' (Berlin Graphic Novel - sharp 3-step quantization)
// 2. 'MESSENGER_COZY' (Soft watercolor cartoon - pastel gradient + gentle rim highlight)
// 3. 'INK_OUTLINE' (Comic / Manga / Architectural line art with ink contouring)
// 4. 'RETRO_POSTER' (High-contrast 2-tone vintage screenprint poster look)

window.FFH.activeShaderStyle = 'INK_OUTLINE'; // Default active shader

window.FFH.shaderProfiles = {
  CEL_3BAND: {
    name: 'Berlin Graphic Novel (3-Band Cel)',
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uLightDirection;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightDirection);
        float dotNL = dot(normal, lightDir);
        
        // 3-band quantization
        float intensity = 0.35;
        if (dotNL > 0.55) {
          intensity = 1.0;
        } else if (dotNL > 0.05) {
          intensity = 0.65;
        }
        
        gl_FragColor = vec4(uColor * intensity, 1.0);
      }
    `
  },

  MESSENGER_COZY: {
    name: 'Baked Studio & Soft Ambient (Three.js Journey style)',
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      void main() {
        vLocalPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uLightDirection;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightDirection);
        vec3 viewDir = normalize(vViewPosition);

        // 1. Soft Wrapped Diffuse (Studio Key Light)
        float dotNL = dot(normal, lightDir);
        float diffuse = smoothstep(-0.25, 0.75, dotNL) * 0.55 + 0.45;

        // 2. Baked Ambient Occlusion gradient (darker near floor/crevices)
        float heightAO = smoothstep(-0.2, 1.2, vWorldPosition.y) * 0.35 + 0.65;
        
        // 3. Warm Sky-to-Ground Hemisphere ambient bounce
        vec3 skyColor = vec3(1.0, 0.96, 0.90);
        vec3 bounceColor = vec3(0.85, 0.75, 0.70);
        vec3 ambient = mix(bounceColor, skyColor, normal.y * 0.5 + 0.5);

        // 4. Subtle Studio Rim / Fresnel
        float rim = 1.0 - max(dot(viewDir, normal), 0.0);
        rim = smoothstep(0.65, 1.0, rim) * 0.22;

        vec3 finalColor = uColor * diffuse * ambient * heightAO + (skyColor * rim);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  },

  INK_OUTLINE: {
    name: 'Architectural Ink & Line (Baked Shading + Line Art)',
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uLightDirection;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightDirection);
        float dotNL = dot(normal, lightDir);

        // Three flat bands with soft ambient contact shadow
        float shade = 0.70;
        if (dotNL > 0.40) shade = 1.0;
        else if (dotNL > -0.05) shade = 0.84;

        // Ground contact occlusion
        float ao = smoothstep(-0.2, 1.0, vWorldPosition.y) * 0.2 + 0.8;

        gl_FragColor = vec4(uColor * shade * ao, 1.0);
      }
    `
  },

  RETRO_POSTER: {
    name: 'Retro Screenprint Poster (2-Tone Graphic)',
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uLightDirection;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightDirection);
        float dotNL = dot(normal, lightDir);

        // Sharp high-contrast two-tone posterization
        float tone = step(0.2, dotNL);
        vec3 shadowColor = uColor * 0.4;
        vec3 highlightColor = mix(uColor, vec3(1.0, 0.95, 0.8), 0.3);

        vec3 finalColor = mix(shadowColor, highlightColor, tone);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }
};

// Material registry for live hot-swapping
window.FFH.managedMaterials = [];

window.FFH.createCelMaterial = function(colorHex, customStyleKey) {
  const styleKey = customStyleKey || window.FFH.activeShaderStyle || 'MESSENGER_COZY';
  const profile = window.FFH.shaderProfiles[styleKey] || window.FFH.shaderProfiles.MESSENGER_COZY;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uLightDirection: { value: new THREE.Vector3(1.0, 1.8, 1.2).normalize() }
    },
    vertexShader: profile.vertexShader,
    fragmentShader: profile.fragmentShader
  });

  mat.userData = { originalColor: colorHex };
  window.FFH.managedMaterials.push(mat);
  return mat;
};

// Global function to switch shader styles on the fly without reloading
window.FFH.setShaderStyle = function(styleKey) {
  if (!window.FFH.shaderProfiles[styleKey]) return;
  
  window.FFH.activeShaderStyle = styleKey;
  const profile = window.FFH.shaderProfiles[styleKey];

  window.FFH.managedMaterials.forEach(mat => {
    if (mat) {
      mat.vertexShader = profile.vertexShader;
      mat.fragmentShader = profile.fragmentShader;
      mat.needsUpdate = true;
    }
  });

  console.log(`[FFH Shader Switcher] Swapped active shader to: ${profile.name}`);
};
