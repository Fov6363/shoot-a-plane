// src/config/shopItems.js

import { BUILD_PATHS } from './upgrades.js';

export const SHOP_CATEGORIES = {
  CONSUMABLE: 'consumable',
  PASSIVE: 'passive',
  ACTIVE: 'active',
};

export const SHOP_ITEMS = {
  // ===== 消耗品 =====
  'repair-kit': {
    id: 'repair-kit',
    name: '维修套件',
    description: '立即恢复 2 点 HP',
    category: SHOP_CATEGORIES.CONSUMABLE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 80,
    maxStack: Infinity,
    hideWhenFull: true, // 满血时隐藏
    apply: (player, scene) => {
      player.heal(2);
    },
    canShow: (player) => {
      return player.hp < player.maxHp;
    },
  },

  'full-repair': {
    id: 'full-repair',
    name: '完全维修',
    description: '恢复全部 HP',
    category: SHOP_CATEGORIES.CONSUMABLE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 200,
    maxStack: Infinity,
    hideWhenFull: true,
    apply: (player, scene) => {
      player.hp = player.maxHp;
    },
    canShow: (player) => {
      return player.hp < player.maxHp;
    },
  },

  'bomb': {
    id: 'bomb',
    name: '全屏炸弹',
    description: '按 B 使用，清除全部小怪',
    category: SHOP_CATEGORIES.CONSUMABLE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 150,
    maxStack: 3,
    apply: (player, scene) => {
      player.bombs = (player.bombs || 0) + 1;
    },
    canBuy: (player) => {
      return (player.bombs || 0) < 3;
    },
  },

  'reroll-token': {
    id: 'reroll-token',
    name: '刷新令牌',
    description: '升级选择时可刷新选项',
    category: SHOP_CATEGORIES.CONSUMABLE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 60,
    maxStack: 2,
    apply: (player, scene) => {
      player.rerollTokens = (player.rerollTokens || 0) + 1;
    },
    canBuy: (player) => {
      return (player.rerollTokens || 0) < 2;
    },
  },

  // ===== 被动能力 =====
  'gold-magnet': {
    id: 'gold-magnet',
    name: '金币磁铁',
    description: '击杀金币 +30%',
    category: SHOP_CATEGORIES.PASSIVE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 120,
    maxStack: 1,
    apply: (player, scene) => {
      player.hasGoldMagnet = true;
      if (scene.goldSystem) {
        scene.goldSystem.setGoldMultiplier(1.3);
      }
    },
    canBuy: (player) => {
      return !player.hasGoldMagnet;
    },
  },

  'lucky-coin': {
    id: 'lucky-coin',
    name: '幸运金币',
    description: '+10% 概率获得双倍金币',
    category: SHOP_CATEGORIES.PASSIVE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 100,
    maxStack: 3,
    apply: (player, scene) => {
      player.luckyGoldLevel = (player.luckyGoldLevel || 0) + 1;
      if (scene.goldSystem) {
        scene.goldSystem.setLuckyGoldChance(player.luckyGoldLevel * 0.1);
      }
    },
    canBuy: (player) => {
      return (player.luckyGoldLevel || 0) < 3;
    },
  },

  'armor-plate': {
    id: 'armor-plate',
    name: '装甲板',
    description: '+20% 概率免疫伤害',
    category: SHOP_CATEGORIES.PASSIVE,
    buildPath: BUILD_PATHS.SURVIVAL,
    price: 180,
    maxStack: 3,
    apply: (player, scene) => {
      player.armorPlateLevel = (player.armorPlateLevel || 0) + 1;
      player.dodgeChance = player.armorPlateLevel * 0.2;
    },
    canBuy: (player) => {
      return (player.armorPlateLevel || 0) < 3;
    },
  },

  'revenge-aura': {
    id: 'revenge-aura',
    name: '反击力场',
    description: '受伤时对周围敌人造成 50 伤害',
    category: SHOP_CATEGORIES.PASSIVE,
    buildPath: BUILD_PATHS.SURVIVAL,
    price: 200,
    maxStack: 1,
    apply: (player, scene) => {
      player.hasRevengeAura = true;
    },
    canBuy: (player) => {
      return !player.hasRevengeAura;
    },
  },

  'chain-lightning': {
    id: 'chain-lightning',
    name: '闪电链',
    description: '击杀时闪电跳到最近敌人，造成其 50% HP 伤害',
    category: SHOP_CATEGORIES.PASSIVE,
    buildPath: BUILD_PATHS.BURST,
    price: 200,
    maxStack: 1,
    apply: (player, scene) => {
      player.hasChainLightning = true;
    },
    canBuy: (player) => {
      return !player.hasChainLightning;
    },
  },

  'orbital-drone': {
    id: 'orbital-drone',
    name: '环绕无人机',
    description: '每 2 秒自动对周围敌人造成 10 伤害',
    category: SHOP_CATEGORIES.PASSIVE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 280,
    maxStack: 1,
    apply: (player, scene) => {
      player.hasOrbitalDrone = true;
    },
    canBuy: (player) => {
      return !player.hasOrbitalDrone;
    },
  },

  // ===== 主动能力 =====
  'overcharge': {
    id: 'overcharge',
    name: '过载脉冲',
    description: '按 Q: 3 秒内射速 x3，CD 20 秒',
    category: SHOP_CATEGORIES.ACTIVE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 150,
    maxStack: 1,
    apply: (player, scene) => {
      player.hasOvercharge = true;
      player.overchargeReady = true;
      player.overchargeCD = 0;
    },
    canBuy: (player) => {
      return !player.hasOvercharge;
    },
  },

  'time-anchor': {
    id: 'time-anchor',
    name: '时间锚点',
    description: '按 E: 标记位置和 HP，5 秒后传送回来并恢复',
    category: SHOP_CATEGORIES.ACTIVE,
    buildPath: BUILD_PATHS.GENERAL,
    price: 200,
    maxStack: 1,
    apply: (player, scene) => {
      player.hasTimeAnchor = true;
      player.timeAnchorReady = true;
      player.timeAnchorCD = 0;
    },
    canBuy: (player) => {
      return !player.hasTimeAnchor;
    },
  },
};

/**
 * 获取商店显示的商品列表
 */
export function getShopItemsForDisplay(player) {
  const items = [];
  for (const id in SHOP_ITEMS) {
    const item = SHOP_ITEMS[id];
    // 有 canShow 检查的消耗品（如维修套件满血时隐藏）
    if (item.canShow && !item.canShow(player)) continue;
    items.push({
      ...item,
      soldOut: item.canBuy ? !item.canBuy(player) : false,
    });
  }
  return items;
}
