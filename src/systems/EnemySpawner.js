// src/systems/EnemySpawner.js

import { GAME_CONFIG } from '../config/gameConfig.ts';
import { Enemy, ShooterEnemy, TrackerEnemy } from '../entities/Enemy.js';

export class EnemySpawner {
  constructor(scene, enemyGroup) {
    this.scene = scene;

    // 生成参数
    this.spawnTimer = 0;
    this.baseSpawnInterval = 280; // 基础生成间隔（ms）- 提升节奏
    this.currentSpawnInterval = this.baseSpawnInterval;

    // 难度参数
    this.stage = 1;
    this.stageDifficultyMultiplier = 1.0; // 阶段难度
    this.timeDifficultyMultiplier = 1.0;  // 时间难度
    this.difficultyMultiplier = 1.0;      // 综合难度
    this.gameTime = 0; // 游戏进行时间（秒）

    // 敌人组（从外部传入，确保碰撞检测正确）
    this.enemies = enemyGroup;

    // 已激活的敌人类型
    this.activeEnemyTypes = ['BASIC', 'SHOOTER'];

    // 暂停标记
    this.paused = false;

    // 监听阶段提升
    scene.events.on('stage-increase', this.onStageIncrease, this);
  }

  /**
   * 更新生成器
   */
  update(time, delta) {
    if (this.paused) {
      return;
    }

    // 累计游戏时间
    this.gameTime += delta / 1000;

    // 随时间递增难度
    this.updateDifficulty();

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.currentSpawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }
  }

  /**
   * 随时间更新难度
   */
  updateDifficulty() {
    // 每15秒增加一次难度
    const difficultyLevel = Math.floor(this.gameTime / 15);

    // 时间难度倍率：每15秒增加12%
    this.timeDifficultyMultiplier = 1 + difficultyLevel * 0.12;

    // 综合难度 = 取时间和阶段的较大值
    this.difficultyMultiplier = Math.max(this.timeDifficultyMultiplier, this.stageDifficultyMultiplier);

    // 生成速度：每15秒减少10%间隔（最多减少60%）
    const spawnSpeedUp = Math.min(difficultyLevel * 0.1, 0.6);
    this.currentSpawnInterval = this.baseSpawnInterval * (1 - spawnSpeedUp);

    // 确保最小间隔不低于150ms
    this.currentSpawnInterval = Math.max(this.currentSpawnInterval, 150);
  }

  /**
   * 生成敌人
   */
  spawnEnemy() {
    const { width } = this.scene.cameras.main;

    // 随机X位置
    const x = Phaser.Math.Between(50, width - 50);
    const y = -30;

    // 随机选择敌人类型
    const type = this.getRandomEnemyType();

    // 创建敌人
    let enemy;

    switch (type) {
      case 'BASIC':
        enemy = new Enemy(this.scene, x, y, 'BASIC');
        break;
      case 'SHOOTER':
        enemy = new ShooterEnemy(this.scene, x, y);
        break;
      case 'TRACKER':
        enemy = new TrackerEnemy(this.scene, x, y);
        break;
      case 'HEAVY':
        enemy = new Enemy(this.scene, x, y, 'HEAVY');
        break;
      case 'FAST':
        enemy = new Enemy(this.scene, x, y, 'FAST');
        break;
      default:
        enemy = new Enemy(this.scene, x, y, 'BASIC');
    }

    // 应用难度倍率
    enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * this.difficultyMultiplier));
    enemy.hp = enemy.maxHp;

    // 速度随时间增加，每30秒+8%
    enemy.baseSpeed *= (1 + Math.floor(this.gameTime / 30) * 0.08);
    enemy.setVelocityY(enemy.baseSpeed);

    this.enemies.add(enemy);

    // 重要：添加到组后必须重新设置速度，因为组会重置速度为0
    enemy.setVelocityY(enemy.baseSpeed);

    // 60秒后开始出精英，概率随时间递增，最高15%
    if (this.gameTime > 60) {
      const eliteChance = Math.min(0.15, (this.gameTime - 60) / 600);
      if (Math.random() < eliteChance) {
        enemy.maxHp = Math.round(enemy.maxHp * 2);
        enemy.hp = enemy.maxHp;
        enemy.isElite = true;
        // 精英有额外金币和经验
        enemy.goldValue = (enemy.goldValue || GAME_CONFIG.ENEMY_TYPES[type]?.gold || 1) * 3;
        enemy.xpValue = (enemy.xpValue || GAME_CONFIG.ENEMY_TYPES[type]?.xp || 3) * 2;
        // 视觉：设置黄色 tint
        enemy.setTint(0xffdd00);
      }
    }
  }

  /**
   * 随机选择敌人类型
   */
  getRandomEnemyType() {
    const weights = {
      'BASIC': 40,
      'SHOOTER': 30,
      'TRACKER': 15,
      'HEAVY': 10,
      'FAST': 5
    };

    // 过滤未激活的类型
    const availableTypes = this.activeEnemyTypes;

    // 根据权重随机选择
    const totalWeight = availableTypes.reduce((sum, type) => sum + (weights[type] || 0), 0);
    let random = Math.random() * totalWeight;

    for (const type of availableTypes) {
      random -= weights[type] || 0;
      if (random <= 0) {
        return type;
      }
    }

    return availableTypes[0] || 'BASIC';
  }

  /**
   * 阶段提升
   */
  onStageIncrease(newStage) {
    this.stage = newStage;

    // 阶段难度倍率（不覆盖时间难度，两者取较大值在 updateDifficulty 中处理）
    this.stageDifficultyMultiplier = 1 + (newStage - 1) * GAME_CONFIG.DIFFICULTY.HP_INCREASE;

    // 解锁新敌人类型
    this.unlockEnemyTypes(newStage);
  }

  /**
   * 解锁新敌人类型
   */
  unlockEnemyTypes(stage) {
    if (stage >= 2 && !this.activeEnemyTypes.includes('TRACKER')) {
      this.activeEnemyTypes.push('TRACKER');
    }
    if (stage >= 3 && !this.activeEnemyTypes.includes('HEAVY')) {
      this.activeEnemyTypes.push('HEAVY');
    }
    if (stage >= 4 && !this.activeEnemyTypes.includes('FAST')) {
      this.activeEnemyTypes.push('FAST');
    }
  }

  /**
   * 清除所有敌人
   */
  clearAllEnemies() {
    this.enemies.clear(true, true);
  }

  /**
   * 获取所有敌人
   */
  getEnemies() {
    return this.enemies;
  }

  /**
   * 暂停生成
   */
  pause() {
    this.paused = true;
  }

  /**
   * 恢复生成
   */
  resume() {
    this.paused = false;
  }

  /**
   * 销毁
   */
  destroy() {
    this.scene.events.off('stage-increase', this.onStageIncrease, this);
    this.clearAllEnemies();
  }
}
