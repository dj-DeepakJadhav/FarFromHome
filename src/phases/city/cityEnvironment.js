// CityEnvironment: Manages day-night lighting, atmospheric fog, floating clouds, butterflies, and soaring birds.
window.FFH = window.FFH || {};

window.FFH.CityEnvironment = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;

    this.ambientLight = null;
    this.sunLight = null;
    this.clouds = [];
    this.butterflies = [];
    this.birds = [];
    this.timeOfDay = 0.35;
  }

  setup(worldData) {
    if (worldData) {
      this.clouds = worldData.clouds || [];
      this.butterflies = worldData.butterflies || [];
      this.birds = worldData.birds || [];
    }

    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
    this.sunLight = new THREE.DirectionalLight(0xFFF1D0, 0.95);
    this.sunLight.position.set(24, 35, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.normalBias = 0.02;

    this.game.scene.add(this.ambientLight, this.sunLight);
    // Restore the story clock rather than snapping to a fixed mid-morning.
    // The city phase is torn down and rebuilt on every shop, interior and
    // sleep transition, so a hardcoded 0.35 here meant the sky jumped back to
    // mid-morning every time the player came back outside, whatever the scene
    // said the time was. storyRunner.applyStage records the authored clock.
    const st = this.game && this.game.state;
    const resume = st && typeof st.storyTimeProgress === 'number'
      ? st.storyTimeProgress
      : 0.35;
    this.updateAtmosphericTime(resume);
  }

  // Day/night keyframes. `t` is the fraction of a 24h day, so t = 0.5 is noon.
  //
  // This used to be four hard if/else buckets (<0.25 dawn, <0.6 day, <0.8
  // golden, else night). Two consequences: 19:40 and 22:05 rendered pixel
  // identical, and Day 1's 15:00 to 19:10 was four hours of one unchanging
  // orange. Scenes declare a real clock time, so the lighting interpolates
  // between stops and every authored time now looks like itself.
  static get TIME_STOPS() {
    return {
      summer: [
        { t: 0.00, sky: 0x0D1B2A, fog: 0x0A121C, light: 0x5C7AA0, li: 0.30, amb: 0.28 },
        { t: 0.18, sky: 0x3D5A80, fog: 0x2A3A52, light: 0x8FA9C4, li: 0.45, amb: 0.38 },
        { t: 0.25, sky: 0xFDE2E4, fog: 0xFDE2E4, light: 0xFFB703, li: 0.75, amb: 0.55 },
        { t: 0.33, sky: 0xA8D8D0, fog: 0xDDF2EC, light: 0xFFF3DC, li: 0.90, amb: 0.62 },
        { t: 0.50, sky: 0x76C8B8, fog: 0xD8F3DC, light: 0xFFFAF0, li: 0.95, amb: 0.65 },
        { t: 0.66, sky: 0x8FC7A8, fog: 0xE4EFD4, light: 0xFFE9C0, li: 0.92, amb: 0.60 },
        { t: 0.70, sky: 0xF4A261, fog: 0xE76F51, light: 0xF77F00, li: 0.85, amb: 0.45 },
        { t: 0.79, sky: 0xC96B54, fog: 0x8C4A3E, light: 0xE2683C, li: 0.62, amb: 0.38 },
        { t: 0.86, sky: 0x2E4262, fog: 0x1B2A40, light: 0x8296B8, li: 0.45, amb: 0.33 },
        { t: 0.94, sky: 0x1D2D44, fog: 0x0D1B2A, light: 0x76C8B8, li: 0.40, amb: 0.32 },
        { t: 1.00, sky: 0x0D1B2A, fog: 0x0A121C, light: 0x5C7AA0, li: 0.30, amb: 0.28 }
      ],
      winter: [
        { t: 0.00, sky: 0x090D16, fog: 0x070A11, light: 0x6B7C93, li: 0.28, amb: 0.26 },
        { t: 0.18, sky: 0x2A3A52, fog: 0x1E2838, light: 0x8494AB, li: 0.42, amb: 0.34 },
        { t: 0.25, sky: 0xD0DCE5, fog: 0xC4D7ED, light: 0xF4A261, li: 0.65, amb: 0.50 },
        { t: 0.33, sky: 0xC2D4E6, fog: 0xCFE0F2, light: 0xEDF3F7, li: 0.78, amb: 0.56 },
        { t: 0.50, sky: 0xB8D0EB, fog: 0xD0E1FD, light: 0xE8F1F5, li: 0.85, amb: 0.60 },
        { t: 0.66, sky: 0x9DB6D4, fog: 0xC3D6EE, light: 0xE4EAF0, li: 0.80, amb: 0.54 },
        { t: 0.70, sky: 0x6E7FA0, fog: 0x4A5670, light: 0xEE6C4D, li: 0.70, amb: 0.42 },
        { t: 0.79, sky: 0x46587A, fog: 0x2E3A52, light: 0xD2603F, li: 0.56, amb: 0.36 },
        { t: 0.86, sky: 0x28374F, fog: 0x18222F, light: 0x8296B8, li: 0.44, amb: 0.31 },
        { t: 0.94, sky: 0x0F172A, fog: 0x090D16, light: 0x94A3B8, li: 0.38, amb: 0.30 },
        { t: 1.00, sky: 0x090D16, fog: 0x070A11, light: 0x6B7C93, li: 0.28, amb: 0.26 }
      ]
    };
  }

  updateAtmosphericTime(progress) {
    this.timeOfDay = ((progress % 1.0) + 1.0) % 1.0;   // tolerate negatives
    const isWinter = this.game && this.game.state && this.game.state.semester === 'WINTER';
    const stops = window.FFH.CityEnvironment.TIME_STOPS[isWinter ? 'winter' : 'summer'];

    // Find the pair of stops bracketing the current time and blend between them.
    let a = stops[0], b = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (this.timeOfDay >= stops[i].t && this.timeOfDay <= stops[i + 1].t) {
        a = stops[i]; b = stops[i + 1];
        break;
      }
    }
    const span = b.t - a.t;
    const k = span > 0 ? (this.timeOfDay - a.t) / span : 0;

    const skyColor = new THREE.Color(a.sky).lerp(new THREE.Color(b.sky), k);
    const fogColor = new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), k);
    const lightColor = new THREE.Color(a.light).lerp(new THREE.Color(b.light), k);
    const lightIntensity = THREE.MathUtils.lerp(a.li, b.li, k);
    const ambIntensity = THREE.MathUtils.lerp(a.amb, b.amb, k);

    this.game.scene.background = skyColor;
    this.game.scene.fog = new THREE.FogExp2(fogColor, isWinter ? 0.020 : 0.015);

    if (this.ambientLight) this.ambientLight.intensity = ambIntensity;
    if (this.sunLight) {
      this.sunLight.color = lightColor;
      this.sunLight.intensity = lightIntensity;
    }
    if (this.game.sfx) {
      this.game.sfx.playBgm(this.timeOfDay > 0.82 || this.timeOfDay < 0.22 ? 'night' : 'day');
    }
  }

  update(delta, timeSec) {
    // 1. Water waves
    if (this.phase.waterMat && this.phase.waterMat.uniforms) {
      if (this.phase.waterMat.uniforms.uTime) {
        this.phase.waterMat.uniforms.uTime.value = timeSec;
      }
      if (this.phase.waterMat.uniforms.uCamXZ) {
        this.phase.waterMat.uniforms.uCamXZ.value.set(this.phase.playerPos.x, this.phase.playerPos.z);
      }
    }

    // 2. Move Floating Clouds
    this.clouds.forEach(cloud => {
      cloud.position.x += (cloud.userData.speed || 0.5) * delta;
      if (cloud.position.x > 40) cloud.position.x = -8;
    });

    // 3. Animate Butterflies
    this.butterflies.forEach(bf => {
      const elapsed = timeSec + bf.userData.seed;
      const leftWing = bf.getObjectByName('leftWing');
      const rightWing = bf.getObjectByName('rightWing');
      if (leftWing && rightWing) {
        leftWing.rotation.y = Math.sin(elapsed * 25) * 0.8;
        rightWing.rotation.y = -Math.sin(elapsed * 25) * 0.8;
      }
      bf.position.y = 0.35 + Math.sin(elapsed * 4) * 0.2;
      bf.position.x = bf.userData.baseX + Math.sin(elapsed * 2) * 0.4;
      bf.position.z = bf.userData.baseZ + Math.cos(elapsed * 2) * 0.4;
    });

    // 4. Animate Soaring Birds
    this.birds.forEach(bird => {
      const loop = bird.userData.loop;
      if (!loop || loop.length === 0) return;

      const target = loop[bird.userData.currentWp];
      const dx = target.x - bird.position.x;
      const dy = target.y - bird.position.y;
      const dz = target.z - bird.position.z;
      const dist = Math.hypot(dx, dy, dz);

      if (dist < 2.5) {
        bird.userData.currentWp = (bird.userData.currentWp + 1) % loop.length;
      } else {
        const dirX = dx / dist;
        const dirY = dy / dist;
        const dirZ = dz / dist;
        const step = (bird.userData.speed || 5.0) * delta;

        bird.position.x += dirX * step;
        bird.position.y += dirY * step;
        bird.position.z += dirZ * step;

        const targetRotY = Math.atan2(dirX, dirZ);
        bird.rotation.y = THREE.MathUtils.lerp(bird.rotation.y, targetRotY, delta * 3.0);
      }
    });
  }

  dispose() {
    if (this.ambientLight) {
      this.game.scene.remove(this.ambientLight);
      this.ambientLight = null;
    }
    if (this.sunLight) {
      this.game.scene.remove(this.sunLight);
      this.sunLight = null;
    }
    this.clouds = [];
    this.butterflies = [];
    this.birds = [];
  }
};
