// src/systems/UpgradeSystem.js

import { UPGRADES, getRandomUpgrades } from '../config/upgrades.js';

export class UpgradeSystem {
  constructor(scene) {
    this.scene = scene;
    this.player = scene.player;

    // 玩家已获得的升级及等级
    this.playerUpgrades = {};

    // 监听升级事件
    scene.events.on('level-up', this.onLevelUp, this);
    scene.events.on('upgrade-selected', this.applyUpgrade, this);
  }

  /**
   * 玩家升级时触发
   */
  onLevelUp(level) {
    // 暂停游戏
    this.scene.scene.pause('GameScene');

    // 获取3个随机升级选项
    const options = this.getUpgradeOptions(3);

    // 启动升级选择场景并置顶（UpgradeScene 注册顺序在 GameScene 之前，需要手动提升）
    this.scene.scene.launch('UpgradeScene', {
      options: options
    });
    this.scene.scene.bringToTop('UpgradeScene');
  }

  /**
   * 获取升级选项
   */
  getUpgradeOptions(count = 3) {
    return getRandomUpgrades(this.playerUpgrades, count);
  }

  /**
   * 应用选中的升级
   */
  applyUpgrade(upgradeId) {
    const upgrade = UPGRADES[upgradeId];

    if (!upgrade) {
      console.error(`Unknown upgrade: ${upgradeId}`);
      return;
    }

    // 记录升级等级
    if (!this.playerUpgrades[upgradeId]) {
      this.playerUpgrades[upgradeId] = 0;
    }
    this.playerUpgrades[upgradeId]++;

    const currentLevel = this.playerUpgrades[upgradeId];

    // 应用升级效果
    if (upgrade.apply) {
      upgrade.apply(this.player, currentLevel);
    }

    // 特殊处理：经验倍率
    if (upgradeId === 'xp-multiplier' && this.scene.experienceSystem) {
      const multiplier = 1 + (currentLevel * 0.25);
      this.scene.experienceSystem.setXPMultiplier(multiplier);
    }

    // 触发升级完成事件
    this.scene.events.emit('upgrade-applied', {
      upgradeId,
      upgrade,
      level: currentLevel
    });

    // 关闭升级场景，恢复游戏
    this.scene.scene.stop('UpgradeScene');
    this.scene.scene.resume('GameScene');
  }

  /**
   * 获取玩家已有的升级
   */
  getPlayerUpgrades() {
    return { ...this.playerUpgrades };
  }

  /**
   * 获取特定升级的等级
   */
  getUpgradeLevel(upgradeId) {
    return this.playerUpgrades[upgradeId] || 0;
  }

  /**
   * 检查玩家是否拥有某个升级
   */
  hasUpgrade(upgradeId) {
    return this.playerUpgrades[upgradeId] > 0;
  }

  /**
   * 销毁
   */
  destroy() {
    this.scene.events.off('level-up', this.onLevelUp, this);
    this.scene.events.off('upgrade-selected', this.applyUpgrade, this);
  }
}
