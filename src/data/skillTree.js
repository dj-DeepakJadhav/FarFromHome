// Expat Adaptation Skill Tree System (The "Startup Panic" Progression Engine for Far From Home)
window.FFH = window.FFH || {};

window.FFH.SKILL_TREE = {
  hustler: {
    id: 'hustler',
    title: 'The Courier Hustler',
    icon: '🚴',
    color: '#2A9D8F',
    desc: 'Master the streets, cobblestone navigation, and lightning-fast order packing.',
    skills: [
      {
        id: 'hustler_cobblestone',
        name: 'Cobblestone Drift',
        cost: 1,
        tier: 1,
        icon: '⚡',
        descEn: 'Increase cycling speed by +25% across historic cobblestone streets.',
        effect: (state) => { state.bikeSpeedMult = (state.bikeSpeedMult || 1.0) * 1.25; }
      },
      {
        id: 'hustler_quickpack',
        name: 'Quick-Pack Vision',
        cost: 2,
        tier: 2,
        icon: '👀',
        descEn: 'Gain +3.0s grace buffer on warehouse picking timers for easier streaks.',
        effect: (state) => { state.pickGraceTimeBonus = (state.pickGraceTimeBonus || 0) + 3; }
      },
      {
        id: 'hustler_vip_legend',
        name: 'VIP Rush Legend',
        cost: 3,
        tier: 3,
        icon: '🔥',
        descEn: 'High-Stakes VIP Express shifts yield an unprecedented 3.0x customer tip multiplier.',
        effect: (state) => { state.vipTipMultiplier = 3.0; }
      }
    ]
  },

  bureaucrat: {
    id: 'bureaucrat',
    title: 'The Bureaucrat',
    icon: '📜',
    color: '#1D3557',
    desc: 'Decode Beamtendeutsch, master municipal law, and optimize student tax allowances.',
    skills: [
      {
        id: 'bureaucrat_beamtendeutsch',
        name: 'Beamtendeutsch Decoded',
        cost: 1,
        tier: 1,
        icon: '📑',
        descEn: 'Unlock AStA emergency student hardship grants (+25€ one-time bursary).',
        effect: (state) => { state.wallet = window.FFH.round2(state.wallet + 25); }
      },
      {
        id: 'bureaucrat_tax_id',
        name: 'Steuer-ID Tax Exemption',
        cost: 2,
        tier: 2,
        icon: '🪙',
        descEn: 'Earn +15% higher net shift wages through student social security exemption.',
        effect: (state) => { state.wageBonusPercent = 0.15; }
      },
      {
        id: 'bureaucrat_stempel_aura',
        name: 'Stempel Master',
        cost: 3,
        tier: 3,
        icon: '🏛️',
        descEn: 'Dr. Lindemann at Ausländerbehörde grants +25 relationship and expedited visa processing.',
        effect: (state) => { state.npcRelationships['NPC_LINDEMANN'] = 100; }
      }
    ]
  },

  diplomat: {
    id: 'diplomat',
    title: 'The Local Diplomat',
    icon: '☕',
    color: '#F4A261',
    desc: 'Build deep neighborhood bonds, conquer culture shock, and master student thrift.',
    skills: [
      {
        id: 'diplomat_moin_charm',
        name: 'Northern "Moin" Charm',
        cost: 1,
        tier: 1,
        icon: '🥐',
        descEn: 'Receive a 20% discount on all bakery bread, pizzas, and gear shop upgrades.',
        effect: (state) => { state.shopDiscount = 0.20; }
      },
      {
        id: 'diplomat_pfand_baron',
        name: 'Pfand Baron',
        cost: 2,
        tier: 2,
        icon: '🍾',
        descEn: 'Double bottle deposit return value with Nico (+1.50€ cash per recycling run).',
        effect: (state) => { state.pfandBonusMult = 2.0; }
      },
      {
        id: 'diplomat_stosslueften_zen',
        name: 'Stoßlüften Zen Master',
        cost: 3,
        tier: 3,
        icon: '🌬️',
        descEn: 'Freshness decays 50% slower, and room shock-ventilation restores +40 Freshness.',
        effect: (state) => { state.stosslueftenBonus = 40; }
      }
    ]
  }
};

window.FFH.canUnlockSkill = function(skillId, state = window.FFH.state) {
  state.unlockedSkills = state.unlockedSkills || {};
  state.skillPoints = state.skillPoints !== undefined ? state.skillPoints : 1;
  
  if (state.unlockedSkills[skillId]) return false; // Already owned

  for (const branchKey in window.FFH.SKILL_TREE) {
    const branch = window.FFH.SKILL_TREE[branchKey];
    const skillIdx = branch.skills.findIndex(s => s.id === skillId);
    if (skillIdx !== -1) {
      const skill = branch.skills[skillIdx];
      if (state.skillPoints < skill.cost) return false;
      // Require previous tier in same branch
      if (skillIdx > 0) {
        const prevSkill = branch.skills[skillIdx - 1];
        if (!state.unlockedSkills[prevSkill.id]) return false;
      }
      return true;
    }
  }
  return false;
};

window.FFH.unlockSkill = function(skillId, state = window.FFH.state) {
  if (!window.FFH.canUnlockSkill(skillId, state)) return false;

  for (const branchKey in window.FFH.SKILL_TREE) {
    const branch = window.FFH.SKILL_TREE[branchKey];
    const skill = branch.skills.find(s => s.id === skillId);
    if (skill) {
      state.skillPoints -= skill.cost;
      state.unlockedSkills[skillId] = true;
      if (skill.effect) skill.effect(state);
      return skill;
    }
  }
  return false;
};
