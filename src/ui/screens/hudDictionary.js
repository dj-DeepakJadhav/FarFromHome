// Skill Tree Modal (Parallel Node Tree Format)(Path of Exile / RPG Style)
window.FFH = window.FFH || {};
if (!window.FFH.UI) {
  window.FFH.UI = function(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  };
}

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
      background: rgba(10, 17, 30, 0.92);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      padding: 14px;
      box-sizing: border-box;
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      animation: fadeIn 0.2s ease;
      pointer-events: auto;
    `;

    const renderTree = () => {
      let columnsHtml = '';

      for (const bKey in window.FFH.SKILL_TREE) {
        const branch = window.FFH.SKILL_TREE[bKey];
        
        const nodesHtml = branch.skills.map((skill, idx) => {
          const isOwned = !!state.unlockedSkills[skill.id];
          const canUnlock = window.FFH.canUnlockSkill ? window.FFH.canUnlockSkill(skill.id, state) : false;

          let nodeBorder = '#CBD5E0';
          let nodeBg = '#FFFFFF';
          let iconGlow = 'none';
          let btnText = `UNLOCK (${skill.cost} SP)`;
          let btnClass = 'btn-unlock-skill';

          if (isOwned) {
            nodeBorder = '#2A9D8F';
            nodeBg = 'linear-gradient(135deg, #E6F4F1 0%, #CCECE6 100%)';
            iconGlow = '0 0 10px rgba(42, 157, 143, 0.4)';
            btnText = 'LEARNED ★';
          } else if (canUnlock) {
            nodeBorder = '#E76F51';
            nodeBg = 'linear-gradient(135deg, #FDF0ED 0%, #F8D7DA 100%)';
            iconGlow = '0 0 10px rgba(231, 111, 81, 0.4)';
          }

          // Connecting line between tier nodes in the branch
          const connectorLine = idx < branch.skills.length - 1 ? `
            <div style="
              width: 3px; height: 18px;
              background: ${isOwned ? '#2A9D8F' : '#CBD5E0'};
              margin: 4px auto;
              transition: background 0.3s ease;
            "></div>
          ` : '';

          return `
            <div style="
              background: ${nodeBg};
              border: 2px solid ${nodeBorder};
              border-radius: 12px;
              padding: 10px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.06);
              position: relative;
            ">
              <!-- Node Icon Ring -->
              <div style="
                width: 44px; height: 44px;
                border-radius: 50%;
                background: ${isOwned ? '#2A9D8F' : (canUnlock ? '#E76F51' : '#E2E8F0')};
                border: 2px solid #FFFFFF;
                display: flex; align-items: center; justify-content: center;
                font-size: 22px;
                box-shadow: ${iconGlow};
                margin-bottom: 6px;
              ">
                ${skill.icon}
              </div>

              <!-- Node Info -->
              <div style="font-size: 11px; font-weight: 900; color: #1D3557; margin-bottom: 2px;">${skill.name}</div>
              <div style="font-size: 9.5px; color: #4A5568; line-height: 1.3; margin-bottom: 8px; flex: 1;">${skill.descEn}</div>

              <!-- Unlock Action Button -->
              <button class="${btnClass}" data-skill="${skill.id}" style="
                width: 100%;
                background: ${isOwned ? '#2A9D8F' : (canUnlock ? '#E76F51' : '#CBD5E0')};
                color: #FFFFFF;
                border: 1px solid rgba(0,0,0,0.1);
                border-radius: 6px;
                padding: 6px;
                font-size: 9.5px;
                font-weight: 900;
                cursor: ${canUnlock && !isOwned ? 'pointer' : 'default'};
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                white-space: nowrap;
              ">${btnText}</button>
            </div>
            ${connectorLine}
          `;
        }).join('');

        columnsHtml += `
          <!-- Branch Column -->
          <div style="
            flex: 1;
            min-width: 130px;
            background: #F8F9FA;
            border: 2px solid ${branch.color};
            border-radius: 14px;
            padding: 10px 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          ">
            <!-- Branch Title Header -->
            <div style="
              text-align: center;
              padding-bottom: 6px;
              border-bottom: 2px solid ${branch.color};
              margin-bottom: 8px;
            ">
              <span style="font-size: 18px;">${branch.icon}</span>
              <div style="font-size: 12px; font-weight: 900; color: ${branch.color}; margin-top: 2px;">${branch.title}</div>
            </div>
            
            <!-- Nodes Stack -->
            <div style="display: flex; flex-direction: column; gap: 0;">
              ${nodesHtml}
            </div>
          </div>
        `;
      }

      modal.innerHTML = `
        <div style="
          background: #FFFFFF;
          border-radius: 16px;
          border: 3px solid #1D3557;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-shadow: 0 16px 40px rgba(0,0,0,0.25);
          overflow: hidden;
        ">
          <!-- Top Header Bar -->
          <div style="padding: 12px 14px; background: #1D3557; border-bottom: 3px solid #FFD166; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 15px; font-weight: 900; color: #FFFFFF;">🎓 Expat Survival Skill Tree</div>
              <div style="font-size: 11px; color: #FFD166; font-weight: 800; margin-top: 1px;">Available Skill Points: ${state.skillPoints || 0} SP</div>
            </div>
            <button id="btn-close-skills" style="background: rgba(255,255,255,0.15); border: 1.5px solid #FFFFFF; border-radius: 8px; width: 32px; height: 32px; font-weight: 900; color: #FFFFFF; cursor: pointer;">✕</button>
          </div>

          <!-- Parallel Tree Grid Body -->
          <div id="skills-tree-scroll" style="
            flex: 1;
            overflow-x: auto;
            overflow-y: auto;
            padding: 12px;
            display: flex;
            gap: 10px;
          ">
            ${columnsHtml}
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
              this.spawnFloatingText(`⭐ Learned: ${unlocked.name}!`, window.innerWidth / 2, window.innerHeight / 2, '#38B2AC');
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

