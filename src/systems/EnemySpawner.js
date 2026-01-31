// src/systems/EnemySpawner.js

import { GAME_CONFIG } from '../config/gameConfig.ts';
import { Enemy, ShooterEnemy, TrackerEnemy } from '../entities/Enemy.js';

export class EnemySpawner {
  constructor(scene, enemyGroup) {
    this.scene = scene;

    // 生成参数
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1200; // 基础生成间隔（ms）- 提高出现频率
    this.currentSpawnInterval = this.baseSpawnInterval;

    // 难度参数
    this.stage = 1;
    this.difficultyMultiplier = 1.0;
    this.gameTime = 0; // 游戏进行时间（秒）

    // 敌人组（从外部传入，确保碰撞检测正确）
    this.enemies = enemyGroup;
    console.log('EnemySpawner 接收到敌人组:', this.enemies);

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
    // 每30秒增加一次难度
    const difficultyLevel = Math.floor(this.gameTime / 30);

    // 难度倍率：每30秒增加10%
    this.difficultyMultiplier = 1 + difficultyLevel * 0.1;

    // 生成速度：每30秒减少10%间隔（最多减少60%）
    const spawnSpeedUp = Math.min(difficultyLevel * 0.1, 0.6);
    this.currentSpawnInterval = this.baseSpawnInterval * (1 - spawnSpeedUp);

    // 确保最小间隔不低于400ms
    this.currentSpawnInterval = Math.max(this.currentSpawnInterval, 400);
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
    enemy.maxHp = Math.floor(enemy.maxHp * this.difficultyMultiplier);
    enemy.hp = enemy.maxHp;

    // 基础速度提升20%，然后随难度继续增加
    enemy.baseSpeed *= 1.2 * (1 + Math.floor(this.gameTime / 30) * 0.05);
    enemy.setVelocityY(enemy.baseSpeed);

    this.enemies.add(enemy);

    // 重要：添加到组后必须重新设置速度，因为组会重置速度为0
    enemy.setVelocityY(enemy.baseSpeed);

    console.log('修复后的速度:', enemy.body.velocity.y);

    console.log('生成敌人:', {
      type: type,
      position: { x: enemy.x, y: enemy.y },
      hp: enemy.hp,
      visible: enemy.visible,
      active: enemy.active,
      texture: enemy.texture.key,
      displayWidth: enemy.displayWidth,
      displayHeight: enemy.displayHeight,
      hasBody: !!enemy.body,
      bodyEnabled: enemy.body ? enemy.body.enable : 'no body',
      velocity: enemy.body ? { x: enemy.body.velocity.x, y: enemy.body.velocity.y } : 'no body',
      baseSpeed: enemy.baseSpeed
    });
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

    // 增加难度
    this.difficultyMultiplier = 1 + (newStage - 1) * GAME_CONFIG.DIFFICULTY.HP_INCREASE;

    // 减少生成间隔
    const spawnRateIncrease = (newStage - 1) * GAME_CONFIG.DIFFICULTY.SPAWN_RATE_INCREASE;
    this.currentSpawnInterval = this.baseSpawnInterval / (1 + spawnRateIncrease);

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
