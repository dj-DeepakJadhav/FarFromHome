// Particle systems for picking success bursts and star bursts
window.FFH.ParticleSystem = class {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.ambientMotes = [];
  }

  initAmbientMotes() {
    // Disabled to prevent ink-outline edge shader from drawing black outline rings around motes
  }

  spawnBurst(x, y, z, colorHex, count = 16) {
    const geo = new THREE.DodecahedronGeometry(0.07, 0);
    
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.5;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 3.5 + 2.5,
        Math.sin(angle) * speed
      );
      
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        gravity: 8.5,
        life: 1.0,
        decay: Math.random() * 1.2 + 0.8,
        rotSpeed: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6)
      });
    }
  }

  spawnStarSparkles(x, y, z) {
    this.spawnBurst(x, y, z, 0xFFD166, 12);
    this.spawnBurst(x, y, z, 0x06D6A0, 8);
  }

  spawnErrorSparks(x, y, z) {
    this.spawnBurst(x, y, z, 0xEF476F, 14);
  }
  
  update(delta) {
    // 1. Update ambient floating motes
    const time = performance.now() * 0.001;
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      m.mesh.position.y += Math.sin(time * m.speed + m.phase) * 0.003;
      m.mesh.position.x += m.driftX * delta * 0.2;
      m.mesh.position.z += m.driftZ * delta * 0.2;

      // Wrap around bounds
      if (m.mesh.position.x > 3) m.mesh.position.x = -3;
      if (m.mesh.position.x < -3) m.mesh.position.x = 3;
      if (m.mesh.position.z > 3) m.mesh.position.z = -3;
      if (m.mesh.position.z < -3) m.mesh.position.z = 3;
    }

    // 2. Update dynamic burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta * p.decay;
      
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      } else {
        p.velocity.y -= p.gravity * delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        if (p.rotSpeed) {
          p.mesh.rotation.x += p.rotSpeed.x * delta;
          p.mesh.rotation.y += p.rotSpeed.y * delta;
        }
        p.mesh.scale.setScalar(p.life);
      }
    }
  }
};
