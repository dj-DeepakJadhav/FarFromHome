// Dialogue Box UI
window.FFH = window.FFH || {};

Object.assign(window.FFH.UI.prototype, {
  showDialogueBox(npcEntry, dialogueData, onOptionChosen) {
    const existing = document.getElementById('dialogue-overlay-box');
    if (existing) {
      if (existing._typewriterTimer) clearInterval(existing._typewriterTimer);
      if (window.FFH.game && window.FFH.game.speech) {
        window.FFH.game.speech.stopListening();
      }
      existing.remove();
    }

    const box = document.createElement('div');
    box.id = 'dialogue-overlay-box';
    box.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48vh;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 12px 14px 14px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      z-index: 200;
      overflow: hidden;
    `;

    // Primary spoken line is English for instant emotional clarity and zero reading friction
    let englishText = dialogueData.en || dialogueData.speechEn || dialogueData.text || dialogueData.de || '';

    // Show full options list for story scenes, fallback to 2 for basic NPC chatter
    const options = dialogueData.isStory ? (dialogueData.options || []) : (dialogueData.options || []).slice(0, 3);

    const optionsHtml = options.map((opt, idx) => {
      const primaryLabel = opt.label || opt.en || '';
      return `
        <button class="dialogue-opt-btn" data-idx="${idx}" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid ${idx === 0 ? '#2EC4B6' : '#E76F51'};
          border-radius: 12px;
          padding: 9px 12px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
          transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
          line-height: 1.35;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        ">
          <span style="flex: 1;">${primaryLabel}</span>
          <span style="font-size: 13px; opacity: 0.7;">➔</span>
        </button>
      `;
    }).join('');

    box.innerHTML = `
      <!-- Header: Speaker Name & Role -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #F0F4F8; padding-bottom: 5px; margin-bottom: 4px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${npcEntry.avatarColor || '#2EC4B6'};"></div>
          <div>
            <div style="font-size: 13px; font-weight: 900; color: #264653; line-height: 1.1;">${dialogueData.speaker || npcEntry.name}</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #7F8C8D; text-transform: uppercase; letter-spacing: 0.5px;">${npcEntry.title || 'Town Citizen'}</div>
          </div>
        </div>
        <div id="dialogue-scroll-indicator" style="font-size: 10px; font-weight: 700; color: #2EC4B6; display: none; align-items: center; gap: 4px; animation: bounce 1s infinite;">
          <span>Scroll for options</span> <span>↓</span>
        </div>
      </div>
      
      <!-- Unified Single Scroll Stream Container -->
      <div id="dialogue-scroll-stream" style="
        flex: 1;
        overflow-y: auto;
        padding: 4px 4px 10px 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        scroll-behavior: smooth;
      ">
        ${dialogueData.actionIntro ? `
        <!-- Narrative Context Card (Action Description) -->
        <div style="
          background: #EBF4F6;
          border-left: 4px solid #2EC4B6;
          border-radius: 8px;
          padding: 8px 10px;
          font-style: italic;
          font-size: 11.5px;
          line-height: 1.4;
          color: #264653;
          font-weight: 600;
          flex-shrink: 0;
        ">${dialogueData.actionIntro}</div>
        ` : ''}

        ${englishText ? `
        <!-- Natural Dialogue Bubble -->
        <div style="
          background: #F4F7F6;
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        ">
          <div id="dialogue-typewriter-text" style="
            font-size: 12.5px;
            line-height: 1.45;
            color: #1D3557;
            font-weight: 700;
          "></div>
        </div>
        ` : ''}

        <!-- Natural Conversation Choices inline in scroll stream with smooth fade-in -->
        <div id="dialogue-options-container" style="
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.35s ease, transform 0.35s ease;
          margin-top: 2px;
        ">
          ${optionsHtml}
        </div>
      </div>
    `;

    this.container.appendChild(box);

    const scrollStream = box.querySelector('#dialogue-scroll-stream');
    const textTarget = box.querySelector('#dialogue-typewriter-text');
    const optionsContainer = box.querySelector('#dialogue-options-container');
    const scrollIndicator = box.querySelector('#dialogue-scroll-indicator');
    
    let charIndex = 0;
    const fullSpeech = englishText;
    const npcId = npcEntry?.id || null;

    const revealOptions = () => {
      if (optionsContainer) {
        optionsContainer.style.opacity = '1';
        optionsContainer.style.transform = 'translateY(0)';
      }
      // Check if user needs to scroll to see options
      if (scrollStream && scrollStream.scrollHeight > scrollStream.clientHeight + 15) {
        if (scrollIndicator) scrollIndicator.style.display = 'flex';
      }
    };

    if (scrollStream) {
      scrollStream.addEventListener('scroll', () => {
        const isNearBottom = scrollStream.scrollHeight - scrollStream.scrollTop - scrollStream.clientHeight < 25;
        if (isNearBottom) {
          if (scrollIndicator) scrollIndicator.style.display = 'none';
          if (optionsContainer) {
            optionsContainer.style.opacity = '1';
            optionsContainer.style.transform = 'translateY(0)';
          }
        }
      });
    }

    if (textTarget) {
      box._typewriterTimer = setInterval(() => {
        if (charIndex < fullSpeech.length) {
          textTarget.textContent += fullSpeech[charIndex];
          if (charIndex % 3 === 0 && this.game && this.game.speech) {
            this.game.speech.playTalkBlip(npcId);
          }
          charIndex++;
        } else {
          clearInterval(box._typewriterTimer);
          revealOptions();
          if (scrollStream) {
            scrollStream.scrollTop = scrollStream.scrollHeight;
          }
        }
      }, 28);

      // Clicking anywhere on dialogue skips typewriter to end immediately
      box.addEventListener('click', (e) => {
        if (e.target.closest('.dialogue-opt-btn')) return;
        if (charIndex < fullSpeech.length) {
          clearInterval(box._typewriterTimer);
          textTarget.textContent = fullSpeech;
          charIndex = fullSpeech.length;
          revealOptions();
          if (scrollStream) {
            scrollStream.scrollTop = scrollStream.scrollHeight;
          }
        }
      });
    } else {
      // If there's no dialogue text at all, just reveal options instantly
      revealOptions();
    }

    const buttons = box.querySelectorAll('.dialogue-opt-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (box._typewriterTimer) clearInterval(box._typewriterTimer);
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (this.game && this.game.speech) {
          this.game.speech.playOptionChime(idx);
        }
        const chosen = dialogueData.options[idx];
        if (onOptionChosen) {
          onOptionChosen(chosen);
        }
      });
    });
  }
});
