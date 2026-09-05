// Vocabulary Dictionary & Skill Tree Modals
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
  },

  showRideMockScreen() {
    // Redundant now that phase is fully implemented. Leave empty.
  },


  showDictionaryModal() {
    const existing = document.getElementById('dictionary-modal');
    if (existing) existing.remove();

    const unlocked = window.FFH.SpacedRepetition ? window.FFH.SpacedRepetition.getUnlockedWords(this.game.state) : window.FFH.items;
    const dueCount = window.FFH.SpacedRepetition ? window.FFH.SpacedRepetition.getDueWords(this.game.state).length : 0;

    const modal = document.createElement('div');
    modal.id = 'dictionary-modal';
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

    modal.innerHTML = `
      <div style="background: #FFFFFF; border-radius: 16px; border-top: 4px solid #2EC4B6; border-bottom: 4px solid #264653; border-left: 2px solid #264653; border-right: 2px solid #264653; display: flex; flex-direction: column; height: 100%; box-shadow: 0 12px 32px rgba(0,0,0,0.4); overflow: hidden;">
        <!-- Header -->
        <div style="padding: 14px 16px; border-bottom: 2px solid #F0F0F0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 16px; font-weight: 900; color: #1D3557;">📖 Vokabel-Wörterbuch</div>
            <div style="font-size: 10.5px; color: #2A9D8F; font-weight: 800;">${unlocked.length} Wörter Gelernt • Leitner Box (1/47)</div>
          </div>
          <button id="btn-close-dict" style="background: #F8F9FA; border: 2px solid #264653; border-radius: 8px; width: 30px; height: 30px; font-weight: 900; color: #264653; cursor: pointer;">✕</button>
        </div>

        <!-- Practice Banner -->
        <div style="background: #FFF3CD; border-bottom: 2px solid #FFEBAA; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; font-weight: 900; color: #856404;">🎯 Spaced Repetition Practice</div>
            <div style="font-size: 10px; color: #856404;">${dueCount > 0 ? dueCount + ' words ready for review!' : 'All words reviewed for this shift!'}</div>
          </div>
          <button id="btn-start-quiz" style="background: #E76F51; color: #FFF; border: 2px solid #264653; border-radius: 8px; padding: 6px 12px; font-weight: 900; font-size: 11px; cursor: pointer; box-shadow: 0 2px 0 #D65A3C;">🎮 PRACTICE</button>
        </div>

        <!-- Word List / Quiz Container -->
        <div id="dict-content-body" style="flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
        </div>
      </div>
    `;

    document.getElementById('ui-container').appendChild(modal);

    const renderWordList = () => {
      const body = modal.querySelector('#dict-content-body');
      body.innerHTML = unlocked.map(item => {
        const srs = (this.game.state.vocabSRS && this.game.state.vocabSRS[item.id]) || { box: 1 };
        const boxStars = '★'.repeat(srs.box) + '☆'.repeat(4 - srs.box);
        const genderColor = item.gender === 'der' ? '#3A86FF' : item.gender === 'die' ? '#FF006E' : '#8338EC';
        const audioKey = item.audioKey || item.id;
        return `
          <div style="background: #F8F9FA; border: 2px solid #E9ECEF; border-left: 5px solid ${genderColor}; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">${item.icon || '📦'}</span>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #1D3557;">
                  <span style="color: ${genderColor};">${item.gender}</span> ${item.nameDe}
                </div>
                <div style="font-size: 10.5px; color: #6C757D; font-style: italic;">${item.nameEn} • ${item.exampleDe || ''}</div>
              </div>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <button class="btn-dict-audio" data-gender="${item.gender}" data-word="${item.nameDe}" style="background: #FFE8D6; border: 1px solid #E76F51; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer;" title="Preview item acoustic sound">🎵</button>
              <div style="font-size: 9px; color: #F4A261; font-weight: 900;">Box ${srs.box} ${boxStars}</div>
            </div>
          </div>
        `;
      }).join('');

      body.querySelectorAll('.btn-dict-audio').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          if (this.game && this.game.speech) {
            this.game.speech.playOptionChime(idx);
          }
        });
      });
    };

    const renderQuizMinigame = () => {
      const body = modal.querySelector('#dict-content-body');
      const testItem = unlocked[Math.floor(Math.random() * unlocked.length)];
      if (!testItem) return;

      const genders = ['der', 'die', 'das'];
      body.innerHTML = `
        <div style="text-align: center; padding: 12px 0;">
          <div style="font-size: 12px; font-weight: 800; color: #2A9D8F; text-transform: uppercase;">Grammar Gender Flashcard</div>
          <div style="font-size: 48px; margin: 8px 0;">${testItem.icon || '📦'}</div>
          <div style="font-size: 22px; font-weight: 900; color: #1D3557; margin-bottom: 4px;">___ ${testItem.nameDe}</div>
          <div style="font-size: 12px; color: #6C757D; font-style: italic;">${testItem.nameEn}</div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          ${genders.map(g => `
            <button class="btn-quiz-answer" data-choice="${g}" style="
              flex: 1;
              padding: 14px 10px;
              background: ${g === 'der' ? '#3A86FF' : g === 'die' ? '#FF006E' : '#8338EC'};
              color: #FFF;
              border: 2px solid #264653;
              border-radius: 10px;
              font-size: 16px;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 4px 0 #1D3557;
            ">${g}</button>
          `).join('')}
        </div>

        <div id="quiz-feedback" style="margin-top: 16px; text-align: center; font-weight: 900; font-size: 13px; min-height: 24px;"></div>
      `;

      body.querySelectorAll('.btn-quiz-answer').forEach(btn => {
        btn.addEventListener('click', () => {
          const choice = btn.getAttribute('data-choice');
          const isCorrect = choice === testItem.gender;
          const fb = body.querySelector('#quiz-feedback');

          if (window.FFH.SpacedRepetition) {
            window.FFH.SpacedRepetition.recordReview(testItem.id, isCorrect, this.game.state);
          }

          if (isCorrect) {
            this.game.sfx.playSfx('early_success');
            fb.innerHTML = `<span style="color: #2A9D8F;">✓ Richtig! ${testItem.gender} ${testItem.nameDe} (${testItem.nameEn})! (+Box Promoted)</span>`;
          } else {
            this.game.sfx.playSfx('error');
            fb.innerHTML = `<span style="color: #E63946;">✗ Falsch! Es heißt: ${testItem.gender} ${testItem.nameDe} (${testItem.nameEn})</span>`;
          }

          setTimeout(() => {
            renderQuizMinigame();
          }, 1200);
        });
      });
    };

    modal.querySelector('#btn-close-dict').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#btn-start-quiz').addEventListener('click', () => {
      renderQuizMinigame();
    });

    renderWordList();
  }
});
