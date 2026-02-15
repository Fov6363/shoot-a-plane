// src/config/gameConfig.ts

import type { GameConfig } from '../types';

export const GAME_CONFIG: GameConfig = {
  // 游戏尺寸
  WIDTH: 800,
  HEIGHT: 600,

  // 玩家配置
  PLAYER: {
    INITIAL_HP: 3,
    INITIAL_SPEED: 300,
    FIRE_RATE: 250, // ms（略快于之前的 300）
    BULLET_SPEED: 400,
    BULLET_DAMAGE: 2, // 初始 2 伤害（前期更爽快）
  },

  // 经验值配置
  EXPERIENCE: {
    BASE_LEVEL_XP: 80, // 降低基础经验门槛
    SMALL_ENEMY_XP: 10,
    MEDIUM_ENEMY_XP: 25,
    LARGE_ENEMY_XP: 50,
    BOSS_XP: 80, // BOSS 给更多经验
  },

  // BOSS配置
  BOSS: {
    STAGE_DURATION: 30000, // 30 秒出 BOSS
    BASE_HP: 150, // 降低基础血量（初始 DPS ~8，约 20 秒打完）
    HP_PER_STAGE: 100, // 每阶段额外增加的 HP
    BASE_SCORE: 1000,
  },

  // 难度递增
  DIFFICULTY: {
    SPAWN_RATE_INCREASE: 0.15,
    HP_INCREASE: 0.20,
    BULLET_SPEED_INCREASE: 0.05,
  },

  // 金币配置
  GOLD: {
    BOSS_BASE_GOLD: 50,
    BOSS_GOLD_PER_STAGE: 30,
  },

  // 敌人类型
  ENEMY_TYPES: {
    BASIC: { hp: 1, score: 10, xp: 3, speed: 100, gold: 1 },
    SHOOTER: { hp: 2, score: 20, xp: 5, speed: 80, gold: 2 },
    TRACKER: { hp: 3, score: 30, xp: 8, speed: 60, gold: 3 },
    HEAVY: { hp: 5, score: 50, xp: 12, speed: 50, gold: 5 },
    FAST: { hp: 2, score: 40, xp: 10, speed: 200, gold: 3 },
  },

  // 物理配置
  PHYSICS: {
    GRAVITY_Y: 0,
  },

  // 颜色配置（像素风格）
  COLORS: {
    PLAYER: 0x00ff00,
    ENEMY: 0xff0000,
    BULLET: 0xffff00,
    ENEMY_BULLET: 0xff6600,
    XP_ORB: 0x00ffff,
    BOSS: 0xff00ff,
  }
};
