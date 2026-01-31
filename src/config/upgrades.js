// src/config/upgrades.js

export const UPGRADE_TYPES = {
  // 属性类
  DAMAGE: 'damage',
  FIRE_RATE: 'fire-rate',
  SPEED: 'speed',
  MAX_HP: 'max-hp',
  AMMO_CAPACITY: 'ammo-capacity',
  XP_MULTIPLIER: 'xp-multiplier',

  // 武器类
  DUAL_SHOT: 'dual-shot',
  SPREAD_SHOT: 'spread-shot',
  LASER: 'laser',
  HOMING_MISSILE: 'homing-missile',
  SIDE_GUNS: 'side-guns',

  // 特殊技能类
  SHIELD: 'shield',
  MAGNET: 'magnet',
  BULLET_TIME: 'bullet-time',
  LIFESTEAL: 'lifesteal',
  PIERCE: 'pierce',
  CRITICAL: 'critical',
  COMBO_DAMAGE: 'combo-damage',
};

export const UPGRADES = {
  // ===== 属性类升级（可重复选择） =====
  [UPGRADE_TYPES.DAMAGE]: {
    id: UPGRADE_TYPES.DAMAGE,
    name: '攻击力提升',
    description: '所有武器伤害 +10%',
    type: 'stat',
    repeatable: true,
    maxLevel: 10,
    value: 0.1, // +10%
    apply: (player, level) => {
      player.damage *= 1.1;
    }
  },

  [UPGRADE_TYPES.FIRE_RATE]: {
    id: UPGRADE_TYPES.FIRE_RATE,
    name: '射速提升',
    description: '射击冷却时间 -15%',
    type: 'stat',
    repeatable: true,
    maxLevel: 8,
    value: 0.15,
    apply: (player, level) => {
      player.fireRate *= 0.85;
    }
  },

  [UPGRADE_TYPES.SPEED]: {
    id: UPGRADE_TYPES.SPEED,
    name: '移动速度提升',
    description: '飞机移速 +10%',
    type: 'stat',
    repeatable: true,
    maxLevel: 8,
    value: 0.1,
    apply: (player, level) => {
      player.speed *= 1.1;
    }
  },

  [UPGRADE_TYPES.MAX_HP]: {
    id: UPGRADE_TYPES.MAX_HP,
    name: '生命值提升',
    description: '最大HP +1',
    type: 'stat',
    repeatable: true,
    maxLevel: 5,
    value: 1,
    apply: (player, level) => {
      player.maxHp += 1;
      player.hp += 1;
    }
  },

  [UPGRADE_TYPES.AMMO_CAPACITY]: {
    id: UPGRADE_TYPES.AMMO_CAPACITY,
    name: '弹药容量提升',
    description: '最大弹药 +20%',
    type: 'stat',
    repeatable: true,
    maxLevel: 5,
    value: 0.2,
    apply: (player, level) => {
      // 这个会在武器系统中处理
    }
  },

  [UPGRADE_TYPES.XP_MULTIPLIER]: {
    id: UPGRADE_TYPES.XP_MULTIPLIER,
    name: '经验倍率提升',
    description: '获得经验值 +25%',
    type: 'stat',
    repeatable: true,
    maxLevel: 4,
    value: 0.25,
    apply: (player, level) => {
      // 这个会在 ExperienceSystem 中处理
    }
  },

  // ===== 武器类升级（初次获得，可多次强化） =====
  [UPGRADE_TYPES.DUAL_SHOT]: {
    id: UPGRADE_TYPES.DUAL_SHOT,
    name: '多重射击',
    description: '每级增加1颗子弹，最终形成扇形弹幕',
    type: 'weapon',
    repeatable: true,
    maxLevel: 10,
    apply: (player, level) => {
      player.weaponDualShot = level;
    }
  },

  // 散弹枪已废弃
  // [UPGRADE_TYPES.SPREAD_SHOT]: {
  //   id: UPGRADE_TYPES.SPREAD_SHOT,
  //   name: '散弹枪',
  //   description: '发射扇形散弹',
  //   type: 'weapon',
  //   repeatable: true,
  //   maxLevel: 3,
  //   apply: (player, level) => {
  //     player.weaponSpreadShot = level;
  //   }
  // },

  // 激光已废弃
  // [UPGRADE_TYPES.LASER]: {
  //   id: UPGRADE_TYPES.LASER,
  //   name: '激光',
  //   description: '发射持续激光束',
  //   type: 'weapon',
  //   repeatable: true,
  //   maxLevel: 3,
  //   apply: (player, level) => {
  //     player.weaponLaser = level;
  //   }
  // },

  // 追踪导弹已废弃
  // [UPGRADE_TYPES.HOMING_MISSILE]: {
  //   id: UPGRADE_TYPES.HOMING_MISSILE,
  //   name: '追踪导弹',
  //   description: '发射自动追踪敌人的导弹',
  //   type: 'weapon',
  //   repeatable: true,
  //   maxLevel: 3,
  //   apply: (player, level) => {
  //     player.weaponHomingMissile = level;
  //   }
  // },

  // 侧翼炮已废弃（作用不大）
  // [UPGRADE_TYPES.SIDE_GUNS]: {
  //   id: UPGRADE_TYPES.SIDE_GUNS,
  //   name: '侧翼炮',
  //   description: '飞机两侧额外武器',
  //   type: 'weapon',
  //   repeatable: true,
  //   maxLevel: 2,
  //   apply: (player, level) => {
  //     player.weaponSideGuns = level;
  //   }
  // },

  // ===== 特殊技能升级（限1次） =====
  [UPGRADE_TYPES.SHIELD]: {
    id: UPGRADE_TYPES.SHIELD,
    name: '护盾',
    description: '抵挡1次伤害后恢复（冷却30秒）',
    type: 'skill',
    repeatable: false,
    maxLevel: 1,
    apply: (player, level) => {
      player.hasShield = true;
    }
  },

  // 磁铁升级已废弃（经验球机制已移除）
  // [UPGRADE_TYPES.MAGNET]: {
  //   id: UPGRADE_TYPES.MAGNET,
  //   name: '磁铁',
  //   description: '自动吸收附近经验值',
  //   type: 'skill',
  //   repeatable: false,
  //   maxLevel: 1,
  //   apply: (player, level) => {
  //     player.hasMagnet = true;
  //   }
  // },

  [UPGRADE_TYPES.BULLET_TIME]: {
    id: UPGRADE_TYPES.BULLET_TIME,
    name: '子弹时间',
    description: '按住Shift减缓时间流速',
    type: 'skill',
    repeatable: false,
    maxLevel: 1,
    apply: (player, level) => {
      player.hasBulletTime = true;
    }
  },

  [UPGRADE_TYPES.LIFESTEAL]: {
    id: UPGRADE_TYPES.LIFESTEAL,
    name: '吸血',
    description: '击杀敌人有10%概率恢复1 HP',
    type: 'skill',
    repeatable: false,
    maxLevel: 1,
    apply: (player, level) => {
      player.hasLifesteal = true;
    }
  },

  [UPGRADE_TYPES.PIERCE]: {
    id: UPGRADE_TYPES.PIERCE,
    name: '穿透子弹',
    description: '子弹可穿透敌人',
    type: 'skill',
    repeatable: false,
    maxLevel: 1,
    apply: (player, level) => {
      player.hasPierce = true;
    }
  },

  [UPGRADE_TYPES.CRITICAL]: {
    id: UPGRADE_TYPES.CRITICAL,
    name: '暴击',
    description: '15%概率造成双倍伤害',
    type: 'skill',
    repeatable: false,
    maxLevel: 1,
    apply: (player, level) => {
      player.hasCritical = true;
    }
  },

  [UPGRADE_TYPES.COMBO_DAMAGE]: {
    id: UPGRADE_TYPES.COMBO_DAMAGE,
    name: '连击增伤',
    description: '连续击中同一目标，每次伤害+1%（可叠加）',
    type: 'skill',
    repeatable: true,
    maxLevel: 10,
    apply: (player, level) => {
      player.comboDamageLevel = level;
      player.comboDamageBonus = 0.01 * level; // 每级+1%
    }
  },
};

/**
 * 获取所有可用的升级选项
 */
export function getAvailableUpgrades(playerUpgrades = {}) {
  const available = [];

  for (const upgradeId in UPGRADES) {
    const upgrade = UPGRADES[upgradeId];
    const currentLevel = playerUpgrades[upgradeId] || 0;

    // 检查是否还能继续升级
    if (currentLevel < upgrade.maxLevel) {
      available.push({
        ...upgrade,
        currentLevel,
        nextLevel: currentLevel + 1
      });
    }
  }

  return available;
}

/**
 * 随机选择N个升级选项
 */
export function getRandomUpgrades(playerUpgrades = {}, count = 3) {
  const available = getAvailableUpgrades(playerUpgrades);

  if (available.length === 0) {
    return [];
  }

  // 洗牌算法
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}
