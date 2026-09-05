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
    this.updateAtmosphericTime(0.35);
  }

  updateAtmosphericTime(progress) {
    this.timeOfDay = progress % 1.0;
    const isWinter = this.game && this.game.state && this.game.state.semester === 'WINTER';

    let skyColor, fogColor, lightColor, lightIntensity, ambIntensity;

    if (isWinter) {
      if (this.timeOfDay < 0.25) {
        skyColor = new THREE.Color(0xD0DCE5);
        fogColor = new THREE.Color(0xC4D7ED);
        lightColor = new THREE.Color(0xF4A261);
        lightIntensity = 0.65;
        ambIntensity = 0.50;
      } else if (this.timeOfDay < 0.6) {
        skyColor = new THREE.Color(0xB8D0EB);
        fogColor = new THREE.Color(0xD0E1FD);
        lightColor = new THREE.Color(0xE8F1F5);
        lightIntensity = 0.85;
        ambIntensity = 0.60;
      } else if (this.timeOfDay < 0.8) {
        skyColor = new THREE.Color(0x3D5A80);
        fogColor = new THREE.Color(0x293241);
        lightColor = new THREE.Color(0xEE6C4D);
        lightIntensity = 0.70;
        ambIntensity = 0.40;
      } else {
        skyColor = new THREE.Color(0x0F172A);
        fogColor = new THREE.Color(0x090D16);
        lightColor = new THREE.Color(0x94A3B8);
        lightIntensity = 0.40;
        ambIntensity = 0.30;
      }
      this.game.scene.background = skyColor;
      this.game.scene.fog = new THREE.FogExp2(fogColor, 0.020);
    } else {
      if (this.timeOfDay < 0.25) {
        skyColor = new THREE.Color(0xFDE2E4);
        fogColor = new THREE.Color(0xFDE2E4);
        lightColor = new THREE.Color(0xFFB703);
        lightIntensity = 0.75;
        ambIntensity = 0.55;
      } else if (this.timeOfDay < 0.6) {
        skyColor = new THREE.Color(0x76C8B8);
        fogColor = new THREE.Color(0xD8F3DC);
        lightColor = new THREE.Color(0xFFFAF0);
        lightIntensity = 0.95;
        ambIntensity = 0.65;
      } else if (this.timeOfDay < 0.8) {
        skyColor = new THREE.Color(0xF4A261);
        fogColor = new THREE.Color(0xE76F51);
        lightColor = new THREE.Color(0xF77F00);
        lightIntensity = 0.85;
        ambIntensity = 0.45;
      } else {
        skyColor = new THREE.Color(0x1D2D44);
        fogColor = new THREE.Color(0x0D1B2A);
        lightColor = new THREE.Color(0x76C8B8);
        lightIntensity = 0.45;
        ambIntensity = 0.35;
      }
      this.game.scene.background = skyColor;
      this.game.scene.fog = new THREE.FogExp2(fogColor, 0.015);
    }

    if (this.ambientLight) this.ambientLight.intensity = ambIntensity;
    if (this.sunLight) {
      this.sunLight.color = lightColor;
      this.sunLight.intensity = lightIntensity;
    }
    if (this.game.sfx) {
      this.game.sfx.playBgm(this.timeOfDay > 0.8 || this.timeOfDay < 0.25 ? 'night' : 'day');
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
