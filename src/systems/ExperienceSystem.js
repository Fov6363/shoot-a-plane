// src/systems/ExperienceSystem.js

import { GAME_CONFIG } from '../config/gameConfig.ts';

export class ExperienceSystem {
  constructor(scene) {
    this.scene = scene;

    this.level = 1;
    this.currentXP = 0;
    this.nextLevelXP = this.calculateNextLevelXP();
    this.xpMultiplier = 1.0;

    // 监听经验值收集
    scene.events.on('xp-collected', this.addXP, this);
  }

  /**
   * 计算下一级所需经验
   */
  calculateNextLevelXP() {
    // 使用 sqrt 缩放，前期升级快，后期平缓增长
    return Math.floor(GAME_CONFIG.EXPERIENCE.BASE_LEVEL_XP * Math.sqrt(this.level));
  }

  /**
   * 添加经验值
   */
  addXP(amount) {
    const actualAmount = Math.floor(amount * this.xpMultiplier);
    this.currentXP += actualAmount;

    // 显示经验值获取
    this.scene.events.emit('xp-gained', actualAmount);

    // 检查升级
    if (this.currentXP >= this.nextLevelXP) {
      this.levelUp();
    }
  }

  /**
   * 升级
   */
  levelUp() {
    this.level++;
    this.currentXP -= this.nextLevelXP;
    this.nextLevelXP = this.calculateNextLevelXP();

    // 触发升级事件
    this.scene.events.emit('level-up', this.level);
  }

  /**
   * 设置经验倍率
   */
  setXPMultiplier(multiplier) {
    this.xpMultiplier = multiplier;
  }

  /**
   * 获取升级进度 (0-1)
   */
  getProgress() {
    return this.currentXP / this.nextLevelXP;
  }

  /**
   * 获取当前数据
   */
  getData() {
    return {
      level: this.level,
      currentXP: this.currentXP,
      nextLevelXP: this.nextLevelXP,
      progress: this.getProgress()
    };
  }

  /**
   * 销毁
   */
  destroy() {
    this.scene.events.off('xp-collected', this.addXP, this);
  }
}
