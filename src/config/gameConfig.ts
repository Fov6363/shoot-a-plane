// src/config/gameConfig.ts

import type { GameConfig } from '../types';

export const GAME_CONFIG: GameConfig = {
  // 游戏尺寸
  WIDTH: 800,
  HEIGHT: 600,

  // 玩家配置
  PLAYER: {
    INITIAL_HP: 3,
    INITIAL_SPEED: 300, // 提高移动速度
    FIRE_RATE: 300, // ms
    BULLET_SPEED: 400,
    BULLET_DAMAGE: 1,
  },

  // 经验值配置
  EXPERIENCE: {
    BASE_LEVEL_XP: 100, // 每级需要的基础经验
    SMALL_ENEMY_XP: 10,
    MEDIUM_ENEMY_XP: 25,
    LARGE_ENEMY_XP: 50,
    BOSS_XP: 200,
  },

  // BOSS配置
  BOSS: {
    STAGE_DURATION: 120000, // 2分钟后出BOSS (ms)
    BASE_HP: 500,
    BASE_SCORE: 1000,
  },

  // 难度递增
  DIFFICULTY: {
    SPAWN_RATE_INCREASE: 0.15,
    HP_INCREASE: 0.20,
    BULLET_SPEED_INCREASE: 0.05,
  },

  // 敌人类型
  ENEMY_TYPES: {
    BASIC: { hp: 1, score: 10, xp: 10, speed: 100 },
    SHOOTER: { hp: 2, score: 20, xp: 15, speed: 80 },
    TRACKER: { hp: 3, score: 30, xp: 25, speed: 60 },
    HEAVY: { hp: 5, score: 50, xp: 40, speed: 50 },
    FAST: { hp: 2, score: 40, xp: 30, speed: 200 },
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
