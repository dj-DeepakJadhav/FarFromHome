// Pick Phase Animation & Visual Feedback Helpers
// Extracted from pickPhase.js to keep phase logic modular and lightweight.
window.FFH = window.FFH || {};

window.FFH.animateBagDrop = function(mesh, bagMesh, onComplete) {
  const startPos = mesh.position.clone();
  const endPos = new THREE.Vector3(0, 0.4, 2.0);
  const duration = 0.45;
  let elapsed = 0;

  const updateTrajectory = () => {
    elapsed += 0.016;
    const t = Math.min(elapsed / duration, 1.0);

    mesh.position.lerpVectors(startPos, endPos, t);
    mesh.position.y += Math.sin(t * Math.PI) * 1.8;

    // Squash and stretch
    const squash = Math.sin(t * Math.PI) * 0.3;
    mesh.scale.set(1.0 + squash, 1.0 - squash * 0.5, 1.0 + squash);

    if (t < 1.0) {
      requestAnimationFrame(updateTrajectory);
    } else {
      if (mesh.parent) mesh.parent.remove(mesh);
      // Bag bounce effect on receive
      if (bagMesh) {
        bagMesh.scale.set(1.2, 0.8, 1.2);
        setTimeout(() => {
          if (bagMesh) bagMesh.scale.set(1.0, 1.0, 1.0);
        }, 120);
      }
      if (onComplete) onComplete();
    }
  };
  updateTrajectory();
};

window.FFH.shakeItem = function(mesh) {
  const startX = mesh.position.x;
  let elapsed = 0;
  const duration = 0.2;

  const runShake = () => {
    elapsed += 0.016;
    if (elapsed < duration) {
      mesh.position.x = startX + Math.sin(elapsed * 100) * 0.15;
      requestAnimationFrame(runShake);
    } else {
      mesh.position.x = startX;
    }
  };
  runShake();
};

window.FFH.pulseRailForGender = function(gender, tagRails, currentShift, ui) {
  const row = gender === 'der' ? 0 : gender === 'die' ? 1 : 2;
  const rail = tagRails[row];

  if (rail) {
    const originalScale = rail.scale.clone();
    const colorSource = rail.material.color || (rail.material.uniforms && rail.material.uniforms.uColor ? rail.material.uniforms.uColor.value : null);
    if (!colorSource) return;

    const originalColor = colorSource.clone();
    let elapsed = 0;
    const pulseDuration = 0.5;
    const flashColor = new THREE.Color(0xffffff);
    const isTutorial = currentShift === 1;

    const pulseInterval = setInterval(() => {
      elapsed += 0.05;
      const t = Math.sin((elapsed / pulseDuration) * Math.PI);
      const currentColorTarget = rail.material.color || (rail.material.uniforms ? rail.material.uniforms.uColor.value : null);

      if (t < 0 || elapsed >= pulseDuration) {
        if (rail.scale) rail.scale.copy(originalScale);
        if (currentColorTarget) currentColorTarget.copy(originalColor);
        if (rail.material && rail.material.uniforms && rail.material.uniforms.uEmissive) {
          rail.material.uniforms.uEmissive.value = new THREE.Color(0x000000);
        } else if (rail.material && rail.material.emissive) {
          rail.material.emissive.setHex(0x000000);
        }
        clearInterval(pulseInterval);
      } else {
        if (rail.scale) {
          rail.scale.set(originalScale.x, originalScale.y * (1 + t * 0.3), originalScale.z * (1 + t * 0.3));
        }
        if (currentColorTarget) {
          currentColorTarget.lerpColors(originalColor, flashColor, t * 0.5);
        }
        if (isTutorial) {
          if (rail.material && rail.material.uniforms && rail.material.uniforms.uEmissive) {
            rail.material.uniforms.uEmissive.value.copy(originalColor).multiplyScalar(t * 1.5);
          } else if (rail.material && rail.material.emissive) {
            rail.material.emissive.copy(originalColor).multiplyScalar(t * 1.5);
          }
        }
      }
    }, 50);
  }
};
