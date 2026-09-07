// City Building Interactions & Story Transitions
window.FFH = window.FFH || {};

window.FFH.handleCityBuildingInteraction = function(phase, poiType) {
    if (this.game.templateManager) {
      const template = this.game.templateManager.getInteractionForPOI(poiType);
      if (template) {
        this.game.templateManager.executeTemplate(template, this);
        return;
      }
    }

    const sr = this.game.storyRunner;
    const s = this.game.state;
    console.log(`[TBI] poi=${poiType} | buzzed=${s.hasBuzzedWG} | mull=${s.hasDoneMuelltrennung} | uni=${s.hasVisitedLockedUni} | pending=${sr && sr.pendingStoryTarget ? sr.pendingStoryTarget.poi : 'none'}`);

    // Check if player is delivering an active grocery order to a customer
    if (this.game.state.activeDelivery) {
      this.game.state.activeDelivery = false;
      if (this.game.ui && this.game.ui.hideCompassUI) {
        this.game.ui.hideCompassUI();
      }
      this.game.transitionTo('DIALOGUE', { isDelivery: true });
      return;
    }

    // Check if it's the pending story target
    if (sr && sr.pendingStoryTarget && poiType === sr.pendingStoryTarget.poi) {
      const nextSceneId = sr.resolveSceneId ? sr.resolveSceneId(sr.pendingStoryTarget.sceneId) : sr.pendingStoryTarget.sceneId;
      sr.pendingStoryTarget = null;
      if (this.game.ui && this.game.ui.hideCompassUI) {
        this.game.ui.hideCompassUI();
      }
      this.game.state.activeObjective = null;
      const qt = document.getElementById('city-quest-tracker');
      if (qt) qt.style.opacity = '0';
      console.log(`CityExploration: Player tapped ${poiType}. Launching scene "${nextSceneId}".`);
      sr.startScene(nextSceneId);
      return;
    }

    let targetNpc = null;
    let storyScene = null;

    // Clean display name mapping for any technical poi names
    const friendlyPoiNames = {
      'B_ZOB': 'Train Station (ZOB)',
      'B_WG': 'Student WG (Apartment)',
      'B_UNI': 'University Campus',
      'B_PIZZA': 'Pizzeria Bella',
      'B_BAKERY': 'Bakery Hansa',
      'B_DARKSTORE': 'Kruma Express Hub',
      'B_RATHAUS': 'Rathaus (City Hall)',
      'B_AUSLAENDER': 'Ausländerbehörde',
      'B_SUPERMARKET': 'Supermarket',
      'LM_MARKTPLATZ': 'Marktplatz'
    };
    const cleanPoiName = friendlyPoiNames[poiType] || poiType.replace(/^B_/, '').replace(/_/g, ' ');

    const cancelAndExit = () => {
      this.isEnteringBuilding = false;
      this.inputDisabled = false;
      this.startBuildingExit();
    };

    // ZOB & TRANSIT HUB
    if (poiType === 'B_ZOB' || poiType.includes('ZOB') || poiType.includes('Station')) {
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought(
          "The timetable says no buses in the town centre. Walk."
        );
      }
      cancelAndExit();
      return;
    }

    // UNIVERSITY ADMISSIONS (B_UNI)
    if (poiType === 'B_UNI') {
      if (sr && typeof sr.startScene === 'function') {
        console.log(`CityExploration: Player entered B_UNI. Launching scene "uni_closed".`);
        sr.startScene('uni_closed');
        return;
      }
    }

    // LOCATION-SPECIFIC SHOPS FOR GEAR UPGRADES
    if (poiType === 'B_PIZZA') {
      if (this.game.ui && this.game.ui.showLocationShopModal) {
        this.game.ui.showLocationShopModal('B_PIZZA', 'Fahrrad Shop & Pizzeria Bella', ['ebike', 'thermalBag'], () => {
          cancelAndExit();
        });
        return;
      }
    } else if (poiType === 'B_DARKSTORE') {
      if (this.game.ui && this.game.ui.showLocationShopModal) {
        this.game.ui.showLocationShopModal('B_DARKSTORE', 'Kruma Express Hub & Depot', ['shelfLabels'], () => {
          cancelAndExit();
        });
        return;
      }
    } else if (poiType === 'B_RATHAUS') {
      if (this.game.ui && this.game.ui.showLocationShopModal) {
        this.game.ui.showLocationShopModal('B_RATHAUS', 'Stationery & Town Hall (Rathaus)', ['pocketNotepad', 'vocabCards'], () => {
          cancelAndExit();
        });
        return;
      }
    }

    // OTHER STORY & CIVIC BUILDINGS
    if (poiType.includes('Hostel') || poiType.includes('Dorm')) {
      targetNpc = 'NPC_WEBER';
      storyScene = 'the_circle_2';
    } else if (poiType.includes('Ausländer') || poiType.includes('Office') || poiType.includes('Dom') || poiType === 'B_AUSLAENDER') {
      targetNpc = 'NPC_LINDEMANN';
      storyScene = 'act_five';
    }

    if (sr && storyScene && (sr.scenesById ? sr.scenesById[storyScene] : sr.scenes[storyScene])) {
      sr.startScene(storyScene);
    } else if (targetNpc) {
      this.game.transitionTo('DIALOGUE', { npcKey: targetNpc });
    } else {
      this.game.ui.spawnFloatingText(`Visited: ${cleanPoiName}`, window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
      if (this.game.sfx && this.game.sfx.playSfx) {
        this.game.sfx.playSfx('success');
      }
      cancelAndExit();
    }
  };
