// Skill Tree Modal
window.FFH = window.FFH || {};

Object.assign(window.FFH.UI.prototype, {
  showSkillTreeModal() {
    const existing = document.getElementById('skill-tree-modal');
    if (existing) existing.remove();

    const state = this.game.state;
    state.unlockedSkills = state.unlockedSkills || {};
    state.skillPoints = state.skillPoints !== undefined ? state.skillPoints : 1;

    const modal = document.createElement('div');
    modal.id = 'skill-tree-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(13, 27, 42, 0.88);
      backdrop-filter: blur(6px);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      padding: 16px 14px;
      box-sizing: border-box;
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      animation: fadeIn 0.2s ease;
      pointer-events: auto;
    `;

    const renderTree = () => {
      let branchesHtml = '';
      for (const bKey in window.FFH.SKILL_TREE) {
        const branch = window.FFH.SKILL_TREE[bKey];
        const skillsHtml = branch.skills.map((skill, idx) => {
          const isOwned = !!state.unlockedSkills[skill.id];
          const canUnlock = window.FFH.canUnlockSkill ? window.FFH.canUnlockSkill(skill.id, state) : false;
          
          let btnBg = '#ADB5BD';
          let btnText = `LOCKED (${skill.cost} SP)`;
          let btnCursor = 'not-allowed';
          
          if (isOwned) {
            btnBg = '#2A9D8F';
            btnText = 'ACQUIRED ★';
            btnCursor = 'default';
          } else if (canUnlock) {
            btnBg = '#FF006E';
            btnText = `UNLOCK (${skill.cost} SP)`;
            btnCursor = 'pointer';
          }

          return `
            <div style="background: ${isOwned ? '#EBFBEE' : '#FFFFFF'}; border: 2px solid ${isOwned ? '#2A9D8F' : (canUnlock ? '#FF006E' : '#D0DCE5')}; border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <span style="font-size: 20px;">${skill.icon}</span>
                <div>
                  <div style="font-size: 12px; font-weight: 900; color: #264653;">${skill.name}</div>
                  <div style="font-size: 10px; color: #666; line-height: 1.25; margin-top: 1px;">${skill.descEn}</div>
                </div>
              </div>
              <button class="btn-unlock-skill" data-skill="${skill.id}" style="
                background: ${btnBg};
                color: #FFFFFF;
                border: 1.5px solid #264653;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 10px;
                font-weight: 900;
                cursor: ${btnCursor};
                box-shadow: 0 2px 0 #264653;
                white-space: nowrap;
                flex-shrink: 0;
              ">${btnText}</button>
            </div>
          `;
        }).join('');

        branchesHtml += `
          <div style="background: #F8F9FA; border-radius: 12px; border: 2px solid ${branch.color}; padding: 10px 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; border-bottom: 1.5px solid #E9ECEF; padding-bottom: 4px;">
              <span style="font-size: 16px;">${branch.icon}</span>
              <span style="font-size: 13px; font-weight: 900; color: ${branch.color};">${branch.title}</span>
            </div>
            <div style="font-size: 10.5px; color: #777; margin-bottom: 8px; font-style: italic;">${branch.desc}</div>
            ${skillsHtml}
          </div>
        `;
      }

      modal.innerHTML = `
        <div style="background: #FFFFFF; border-radius: 16px; border-top: 4px solid #FF006E; border-bottom: 4px solid #264653; border-left: 2px solid #264653; border-right: 2px solid #264653; display: flex; flex-direction: column; height: 100%; box-shadow: 0 12px 32px rgba(0,0,0,0.4); overflow: hidden;">
          <!-- Header -->
          <div style="padding: 12px 14px; border-bottom: 2px solid #F0F0F0; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 15px; font-weight: 900; color: #1D3557;">🎓 Expat Survival Skill Tree</div>
              <div style="font-size: 11px; color: #FF006E; font-weight: 800;">Available Skill Points: ${state.skillPoints || 0} SP</div>
            </div>
            <button id="btn-close-skills" style="background: #F8F9FA; border: 2px solid #264653; border-radius: 8px; width: 30px; height: 30px; font-weight: 900; color: #264653; cursor: pointer;">✕</button>
          </div>

          <!-- Body -->
          <div id="skills-tree-scroll" style="flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column;">
            ${branchesHtml}
          </div>
        </div>
      `;

      // Wire close button
      modal.querySelector('#btn-close-skills').onclick = () => modal.remove();

      // Wire unlock buttons
      modal.querySelectorAll('.btn-unlock-skill').forEach(btn => {
        btn.onclick = () => {
          const skillId = btn.getAttribute('data-skill');
          if (window.FFH.canUnlockSkill && window.FFH.canUnlockSkill(skillId, state)) {
            const unlocked = window.FFH.unlockSkill(skillId, state);
            if (unlocked) {
              this.game.sfx.playSfx('success');
              this.spawnFloatingText(`⭐ Learned: ${unlocked.name}!`, window.innerWidth / 2, window.innerHeight / 2, '#FF006E');
              this.updatePersistentHUD(state);
              renderTree();
            }
          }
        };
      });
    };

    renderTree();
    (document.getElementById('ui-container') || document.body).appendChild(modal);
  }
});
