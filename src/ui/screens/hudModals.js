// Story & Narrative Modals
window.FFH = window.FFH || {};

Object.assign(window.FFH.UI.prototype, {
  showWGBuzzerModal(onSuccessCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('wg-buzzer-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'wg-buzzer-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

    modal.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 4px solid #1D3557;
        border-radius: 20px;
        width: 100%;
        max-width: 340px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #1D3557;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Night Header -->
        <div style="background: #1D3557; padding: 18px 16px; text-align: center; border-bottom: 4px solid #FFD166;">
          <div style="font-size: 32px; margin-bottom: 6px;">🌙</div>
          <div style="font-size: 11.5px; color: #FFD166; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">TAG 1 VORBEI (DAY 1 CONCLUDED)</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 4px; color: #FFFFFF;">22:00 Uhr — Gesetzliche Ruhezeit</div>
        </div>

        <div style="padding: 20px 16px; display: flex; flex-direction: column; gap: 14px;">
          <!-- Financial Reality Box -->
          <div style="background: #F8F9FA; border: 2px solid #1D3557; border-radius: 12px; padding: 14px; font-size: 13px; font-weight: 800; line-height: 1.6; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #457B9D;">Current Wallet:</span>
              <span style="font-weight: 900; color: #2A9D8F;">${wallet} €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #457B9D;">Tuition Needed:</span>
              <span style="font-weight: 900; color: #F4A261;">${goal} €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #457B9D;">Remaining Deficit:</span>
              <span style="font-weight: 900; color: #E76F51;">-${deficit} €</span>
            </div>
            <div style="border-top: 2px dashed #A8DADC; margin: 10px 0;"></div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #457B9D;">Days until Deadline:</span>
              <span style="font-weight: 900; color: #1D3557;">6 Days</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #457B9D;">Pizzeria Rejection:</span>
              <span style="font-weight: 900; color: #E76F51;">1 ("No Italian")</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #457B9D;">Bakery Rejection:</span>
              <span style="font-weight: 900; color: #E76F51;">1 ("B1 German")</span>
            </div>
          </div>

          <!-- British Monologue -->
          <div style="background: #FFF3CD; border: 2px solid #FFE082; border-left: 5px solid #FFD166; border-radius: 8px; padding: 12px; font-size: 12.5px; color: #1D3557; line-height: 1.4; box-shadow: 0 3px 6px rgba(0,0,0,0.05);">
            💭 <em>"Turned down at the pizzeria for being too English, rejected at the bakery for missing a B1 certificate. Nina at Kruma Express is my only hope tomorrow morning."</em>
          </div>

          <!-- Sleep Button -->
          <button id="btn-sleep-morning" style="
            background: #2EC4B6;
            color: #FFFFFF;
            border: 2px solid #1D3557;
            border-radius: 12px;
            padding: 16px;
            font-size: 15px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 0 #1A7A73;
            transition: transform 0.1s, box-shadow 0.1s;
          " onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';" onmouseup="this.style.transform=''; this.style.boxShadow='0 4px 0 #1A7A73';">
            😴 SLEEP (END OF DAY 1)
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    const statusEl = modal.querySelector('#buzzer-status');
    const containerEl = modal.querySelector('#buzzer-buttons-container');

    modal.querySelector('#btn-close-buzzer').onclick = () => {
      modal.remove();
    };

    // Define the 3 doorbells as modular entries
    const buzzerEntries = [
      {
        id: 'buzzer-btn-1',
        label: '🔘 OG 1: Frau Meier',
        subtext: '*Ruhezeit bitte beachten!*',
        borderLeft: '#E76F51',
        onClick: () => {
          if (this.game.sfx) this.game.sfx.playSfx('doorbell_wrong');
          if (window.FFH.NPCMemoryManager) {
            window.FFH.NPCMemoryManager.recordEncounter('NPC_FRAU_MEIER', 'buzzed_at_wrong_hour', -20, this.game.state);
          }
          statusEl.style.display = 'block';
          statusEl.style.background = '#FFE3E3';
          statusEl.style.color = '#C92A2A';
          statusEl.innerHTML = '🔊 Scratchy Intercom: <em>"NEIN! Ruhezeit! Wer wagt es?!"</em> (-1 Noise Strike)';
        }
      },
      {
        id: 'buzzer-btn-2',
        label: '🔘 EG: Hausmeister Schmidt',
        subtext: '*Sprechstunde Mi 14:00-14:15*',
        borderLeft: '#457B9D',
        onClick: () => {
          if (this.game.sfx) this.game.sfx.playSfx('click');
          statusEl.style.display = 'block';
          statusEl.style.background = '#EDF2F7';
          statusEl.style.color = '#4A5568';
          statusEl.innerHTML = '🔊 Heavy static, a deep sigh, and the receiver hangs up.';
        }
      },
      {
        id: 'buzzer-btn-3',
        label: '🔘 3. OG: WG 3B — Nico & Co.',
        subtext: '*Handwritten note: New flatmate welcome!*',
        borderLeft: '#2EC4B6',
        onClick: () => {
          if (this.game.sfx) this.game.sfx.playSfx('bell');
          statusEl.style.display = 'block';
          statusEl.style.background = '#D3F9D8';
          statusEl.style.color = '#2B8A3E';
          statusEl.innerHTML = '⚡ <strong>BZZZZZZT!</strong> The heavy oak latch clicks open!';

          setTimeout(() => {
            modal.remove();
            if (onSuccessCallback) onSuccessCallback();
          }, 700);
        }
      }
    ];

    const shuffled = buzzerEntries;

    // Render the randomly positioned buttons
    shuffled.forEach(item => {
      const btn = document.createElement('button');
      btn.id = item.id;
      btn.style.cssText = `          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid ${item.borderLeft};
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
          box-sizing: border-box;`;
      btn.innerHTML = `
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 900; color: #1D3557;">${item.label}</div>
          <div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">${item.subtext}</div>
        </div>
        <span style="font-size: 13px; opacity: 0.7;">➔</span>
      `;
      btn.onclick = item.onClick;
      containerEl.appendChild(btn);
    });
  },

  showMuelltrennungModal(onCompleteCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('muelltrennung-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'muelltrennung-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

    modal.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <!-- Header -->
        <div style="display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 2px solid #F0F4F8; margin-bottom: 8px;">
          <div style="font-size: 11px; color: #E76F51; font-weight: 800; letter-spacing: 1px;">KÜCHEN-NOTFALL (KITCHEN CRISIS)</div>
          <div style="font-size: 16px; font-weight: 900;">♻️ Nico's Mülltrennung Test!</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; background: #F8F9FA; padding: 10px; border-radius: 10px; border: 1.5px dashed #CBD5E0;">
            <div style="font-size: 32px;">🥛</div>
            <div style="font-size: 12px; color: #2D3748; line-height: 1.4;">
              <strong>Nico holds an empty plastic yogurt pot with foil lid:</strong><br>
              <em>"Quick! Before Herr Becker inspects the bins, where does this go?!"</em>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Bin 1: Blue (Paper) -->
            <button id="bin-blue" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #2EC4B6;
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
          box-sizing: border-box;">
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 900; color: #1D3557;">🟦 Blaue Tonne (Papiermüll)</div>
                <div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">Paper, newspapers, cardboard boxes</div>
              </div>
              <span style="font-size: 13px; opacity: 0.7;">➔</span>
            </button>

            <!-- Bin 2: Yellow (Gelber Sack / Plastic & Metal) -->
            <button id="bin-yellow" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #E76F51;
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
          box-sizing: border-box;">
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 900; color: #1D3557;">🟨 Gelber Sack (Plastic & Foil Packaging)</div>
                <div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">Plastic pots, metal cans, foil lids</div>
              </div>
              <span style="font-size: 13px; opacity: 0.7;">➔</span>
            </button>

            <!-- Bin 3: Black (Restmüll) -->
            <button id="bin-black" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #264653;
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
          box-sizing: border-box;">
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 900; color: #1D3557;">⬛ Restmüll (Residual Waste)</div>
                <div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">Non-recyclable household waste</div>
              </div>
              <span style="font-size: 13px; opacity: 0.7;">➔</span>
            </button>
          </div>

          <div id="bin-feedback" style="display: none; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 800; text-align: center;"></div>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    const feedbackEl = modal.querySelector('#bin-feedback');

    const handleChoice = (isCorrect, message, bg, color) => {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = bg;
      feedbackEl.style.color = color;
      feedbackEl.innerHTML = message;

      if (window.FFH.NPCMemoryManager) {
        if (isCorrect) {
          window.FFH.NPCMemoryManager.recordEncounter('NPC_NICO', 'trash_master', 20, this.game.state);
        } else {
          window.FFH.NPCMemoryManager.recordEncounter('NPC_NICO', 'trash_disaster', -15, this.game.state);
        }
      }

      if (this.game.sfx) {
        this.game.sfx.playSfx(isCorrect ? 'success' : 'wrong');
      }

      setTimeout(() => {
        modal.remove();
        if (onCompleteCallback) onCompleteCallback(isCorrect);
      }, 1200);
    };

    modal.querySelector('#bin-blue').onclick = () => {
      handleChoice(false, '❌ Nico screams in a whisper: <em>"NO! Plastic in the paper bin?! Becker will evict us!"</em>', '#FFE3E3', '#C92A2A');
    };

    modal.querySelector('#bin-yellow').onclick = () => {
      handleChoice(true, '🎉 Nico sighs with massive relief: <em>"Brilliant! You\'re a legend. We live to see tomorrow!"</em> (+2 Trust)', '#D3F9D8', '#2B8A3E');
    };

    modal.querySelector('#bin-black').onclick = () => {
      handleChoice(false, '❌ Nico snatches the pot: <em>"Wrong! Gelber Sack! You almost caused a diplomatic crisis!"</em>', '#FFE3E3', '#C92A2A');
    };
  },

  showTuitionLetterModal(onAcknowledgeCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('tuition-letter-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'tuition-letter-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

    modal.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <!-- Letter Stamp Header -->
        <div style="display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 2px solid #F0F4F8; margin-bottom: 8px;">
          <div>
            <div style="font-size: 10px; color: #E76F51; font-weight: 800; letter-spacing: 1.5px;">OFFICIAL NOTIFICATION</div>
            <div style="font-size: 15px; font-weight: 900;">🏛️ Hochschule Lübeck — Kasse</div>
          </div>
          <div style="font-size: 22px;">📜</div>
        </div>

        <div style="padding: 18px 16px; display: flex; flex-direction: column; gap: 12px;">
          <!-- Official Notice Box -->
          <div style="background: #F8F9FA; border: 1.5px solid #CBD5E0; border-radius: 8px; padding: 12px; font-family: monospace, sans-serif; font-size: 11.5px; color: #2D3748; line-height: 1.5;">
            <div><strong>BETREFF:</strong> Semesterbeitrag (Tuition)</div>
            <div><strong>FÄLLIGKEIT:</strong> Freitag, 17:00 Uhr</div>
            <div style="border-top: 1px dashed #CBD5E0; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between;">
              <span>Tuition Fee Due:</span>
              <span style="font-weight: 900; color: #E76F51;">250.00 €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Current Cash in Pocket:</span>
              <span style="font-weight: 900; color: #2A9D8F;">${(this.game.state.wallet || 20).toFixed(2)} €</span>
            </div>
            <div style="border-top: 1px dashed #CBD5E0; margin: 8px 0;"></div>
            <div style="font-size: 10px; color: #C92A2A; font-weight: 800;">
              *Achtung: Exmatrikulation upon failure to pay.
            </div>
          </div>

          <!-- British Thought Commentary -->
          <div style="background: #FFE8D6; border-left: 4px solid #E76F51; border-radius: 6px; padding: 10px; font-size: 12px; color: #7B241C; line-height: 1.4;">
            💭 <em>"Two hundred and fifty quid?! I’ve got twenty euros and a used yogurt lid. I need to sprint to the University admissions office before they cancel my visa."</em>
          </div>

          <!-- Action Button -->
          <button id="btn-ack-letter" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #2EC4B6;
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
          box-sizing: border-box;">
            <span style="flex: 1; font-size: 13px;">Sprint to University Campus before 17:00!</span>
            <span style="font-size: 13px; opacity: 0.7;">➔</span>
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-ack-letter').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('click');
      modal.remove();
      if (onAcknowledgeCallback) onAcknowledgeCallback();
    };
  },

  showLockedUniModal(onLeaveCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('locked-uni-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'locked-uni-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

    modal.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <!-- Door Header -->
        <div style="display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 2px solid #F0F4F8; margin-bottom: 8px;">
          <div>
            <div style="font-size: 11px; color: #E76F51; font-weight: 800; letter-spacing: 1px;">UNIVERSITÄT LÜBECK</div>
            <div style="font-size: 16px; font-weight: 900;">🔒 Geschlossen (Closed: 17:01)</div>
          </div>
          <div style="font-size: 24px;">🚪</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          <!-- Sign on Door -->
          <div style="background: #FFFBEA; border: 2px solid #ECC238; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 14px; font-weight: 900; color: #7A5E0B;">ÖFFNUNGSZEITEN</div>
            <div style="font-size: 12px; color: #2D3748; margin-top: 4px;">
              Dienstag & Donnerstag: 10:00 – 11:30 Uhr<br>
              <strong>Freitags geschlossen.</strong>
            </div>
            <div style="margin-top: 6px; font-size: 11px; color: #C92A2A; font-weight: 800;">
              *Heavy brass padlock on door handles*
            </div>
          </div>

          <!-- Frau Klein Encounter -->
          <div style="display: flex; gap: 10px; background: #F8F9FA; border: 1.5px solid #CBD5E0; border-radius: 10px; padding: 10px;">
            <div style="font-size: 28px;">🥔</div>
            <div style="font-size: 12px; color: #2D3748; line-height: 1.4;">
              <strong>Frau Klein (passing by with potatoes):</strong><br>
              <em>"Looking for the registrar, boy? In Germany, at 16:59:59 the pen leaves the hand! At 17:01, they are already on the sofa drinking herbal tea. Come back tomorrow!"</em>
            </div>
          </div>

          <!-- British Thought -->
          <div style="background: #FFE8D6; border-left: 4px solid #E76F51; border-radius: 6px; padding: 10px; font-size: 11.5px; color: #7B241C; line-height: 1.35;">
            💭 <em>"A ninety-minute work week! Truly the backbone of the republic. Well, I have no money, no enrollment, and night is falling."</em>
          </div>

          <!-- Leave Button -->
          <button id="btn-leave-uni" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #2EC4B6;
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
          box-sizing: border-box;">
            <span style="flex: 1; font-size: 13px;">Walk Away &amp; Find Work</span>
            <span style="font-size: 13px; opacity: 0.7;">➔</span>
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-leave-uni').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('click');
      // Record Frau Klein Shadow of Mordor memory
      if (window.FFH.NPCMemoryManager) {
        window.FFH.NPCMemoryManager.recordEncounter('NPC_FRAU_KLEIN', 'met_at_locked_uni', 10, this.game.state);
      }
      modal.remove();
      if (onLeaveCallback) onLeaveCallback();
    };
  },

  showDayRecapModal(onSleepCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('day-recap-modal');
    if (prev) prev.remove();

    const s = this.game.state;
    const wallet = (s.wallet !== undefined ? s.wallet : 20.0).toFixed(2);
    const goal = (window.FFH.ECONOMY?.TUITION_GOAL || 250).toFixed(2);
    const deficit = Math.max(0, (window.FFH.ECONOMY?.TUITION_GOAL || 250) - (s.wallet || 20)).toFixed(2);

    const modal = document.createElement('div');
    modal.id = 'day-recap-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(29, 53, 87, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.4s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #1D2D44;
        border: 3px solid #FFD166;
        border-radius: 16px;
        width: 100%;
        max-width: 340px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #FFFFFF;
      ">
        <!-- Night Header -->
        <div style="background: #0D1B2A; padding: 16px; text-align: center; border-bottom: 2px solid #415A77;">
          <div style="font-size: 28px; margin-bottom: 4px;">🌙</div>
          <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 2px;">TAG 1 VORBEI (DAY 1 CONCLUDED)</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">22:00 Uhr — Gesetzliche Ruhezeit</div>
        </div>

        <div style="padding: 18px 16px; display: flex; flex-direction: column; gap: 12px;">
          <!-- Financial Reality Box -->
          <div style="background: rgba(255,255,255,0.06); border: 1px solid #415A77; border-radius: 10px; padding: 12px; font-family: monospace, sans-serif; font-size: 12px; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Current Wallet:</span>
              <span style="font-weight: 900; color: #2EC4B6;">${wallet} €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Tuition Needed:</span>
              <span style="font-weight: 900; color: #FFD166;">${goal} €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Remaining Deficit:</span>
              <span style="font-weight: 900; color: #E76F51;">-${deficit} €</span>
            </div>
            <div style="border-top: 1px dashed #415A77; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Days until Deadline:</span>
              <span style="font-weight: 900; color: #FFF;">6 Days</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Pizzeria Rejection:</span>
              <span style="font-weight: 900; color: #E76F51;">1 ("No Italian")</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Bakery Rejection:</span>
              <span style="font-weight: 900; color: #E76F51;">1 ("B1 German")</span>
            </div>
          </div>

          <!-- British Monologue -->
          <div style="background: rgba(255, 209, 102, 0.1); border-left: 4px solid #FFD166; border-radius: 6px; padding: 10px; font-size: 11.5px; color: #FFE8D6; line-height: 1.35;">
            💭 <em>"Turned down at the pizzeria for being too English, rejected at the bakery for missing a B1 certificate. Nina at Kruma Express is my only hope tomorrow morning."</em>
          </div>

          <!-- Sleep Button -->
          <button id="btn-sleep-morning" style="
            background: #2EC4B6;
            color: #0D1B2A;
            border: 2px solid #FFD166;
            border-bottom: 5px solid #1A7A73;
            border-radius: 12px;
            padding: 14px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">
            😴 SLEEP (END OF DAY 1)
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-sleep-morning').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('bell');
      modal.remove();
      // Show Act 1 Completed Celebration Banner
      if (this.spawnFloatingText) {
        this.spawnFloatingText('🎉 ACT 1 COMPLETED! (DAY 1 SURVIVED)', window.innerWidth / 2, window.innerHeight * 0.4, '#FFD166');
      }
      if (onSleepCallback) onSleepCallback();
    };
  },

  showPizzeriaJobModal(onAcknowledgeCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('pizzeria-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'pizzeria-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

    modal.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <div style="display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 2px solid #F0F4F8; margin-bottom: 8px;">
          <div style="font-size: 11px; color: #E76F51; font-weight: 800; letter-spacing: 1.5px;">LA BELLA NAPOLI</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">🍕 Job Inquiry</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 13.5px; color: #2D3748; line-height: 1.5;">
            You walk into the pizzeria, taking a deep breath of fresh garlic and oregano. You ask the owner if he needs a delivery driver.
          </div>
          
          <div style="background: #F4E8D8; border-left: 5px solid #E76F51; border-radius: 4px; padding: 12px; font-size: 13px; color: #2D3748; font-style: italic;">
            "No Italian, no pizza flipping, and your German sounds like a broken lawnmower! Try the bakery down the street, kid!"<br>
            <strong style="display: block; margin-top: 6px; font-style: normal; font-size: 11px; color: #E76F51;">— Mathias Becker (Owner)</strong>
          </div>

          <button id="btn-leave-pizzeria" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #2EC4B6;
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
          box-sizing: border-box;">
            <span style="flex: 1; font-size: 13px;">Walk Away</span>
            <span style="font-size: 13px; opacity: 0.7;">➔</span>
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-leave-pizzeria').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('wrong');
      modal.remove();
      if (onAcknowledgeCallback) onAcknowledgeCallback();
    };
  },

  showBakeryJobModal(onAcknowledgeCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('bakery-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'bakery-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

    modal.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <div style="display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 2px solid #F0F4F8; margin-bottom: 8px;">
          <div style="font-size: 11px; color: #E76F51; font-weight: 800; letter-spacing: 1.5px;">BÄCKEREI HANSA</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">🥨 Job Inquiry</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 13.5px; color: #2D3748; line-height: 1.5;">
            You enter the bakery, eyeing the warm crusty rye bread. You ask the old lady behind the counter if she needs any help.
          </div>
          
          <div style="background: #F4E8D8; border-left: 5px solid #E76F51; border-radius: 4px; padding: 12px; font-size: 13px; color: #2D3748; font-style: italic;">
            "You want to knead rye bread? You need a B1 German certificate and five years of flour apprenticeship! But Nina at Kruma Express warehouse hires anyone who can cycle without fainting!"<br>
            <strong style="display: block; margin-top: 6px; font-style: normal; font-size: 11px; color: #E76F51;">— Oma Martha</strong>
          </div>

          <button id="btn-leave-bakery" class="dialogue-opt-btn" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #2EC4B6;
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
          box-sizing: border-box;">
            <span style="flex: 1; font-size: 13px;">Walk Away</span>
            <span style="font-size: 13px; opacity: 0.7;">➔</span>
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-leave-bakery').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('wrong');
      modal.remove();
      if (onAcknowledgeCallback) onAcknowledgeCallback();
    };
  }
});
