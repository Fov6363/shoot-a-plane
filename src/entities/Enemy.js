// src/entities/Enemy.js

import { GAME_CONFIG } from '../config/gameConfig.ts';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 缩放到合适大小
    this.setScale(0.5);

    const config = GAME_CONFIG.ENEMY_TYPES[type];

    this.enemyType = type;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.scoreValue = config.score;
    this.xpValue = config.xp;
    this.goldValue = config.gold || 0;
    this.baseSpeed = config.speed;

    this.setVelocityY(this.baseSpeed);
  }

  /**
   * 受伤
   */
  takeDamage(amount) {
    this.hp -= amount;

    // 受伤闪烁
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.hp <= 0) {
      this.onDeath();
      return true;
    }
    return false;
  }

  /**
   * 死亡处理
   */
  onDeath() {
    // 掉落经验球
    this.scene.events.emit('enemy-killed', {
      x: this.x,
      y: this.y,
      xp: this.xpValue,
      score: this.scoreValue,
      gold: this.goldValue
    });

    // 销毁特效
    this.createDeathEffect();

    this.destroy();
  }

  /**
   * 创建死亡特效
   */
  createDeathEffect() {
    const particles = this.scene.add.particles(this.x, this.y, 'enemy', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      tint: 0xff0000,
      lifespan: 300,
      quantity: 8,
      blendMode: 'ADD'
    });

    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }

  /**
   * 更新
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // 超出屏幕销毁
    if (this.y > this.scene.cameras.main.height + 50) {
      this.destroy();
    }

    // 子类特定行为
    this.updateBehavior(time, delta);
  }

  /**
   * 子类覆盖此方法实现特定行为
   */
  updateBehavior(time, delta) {
    // 基础敌人只是直线下落，无特殊行为
  }
}

/**
 * 射击敌机
 */
export class ShooterEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'SHOOTER');
    this.lastShot = 0;
    this.shootInterval = 2000; // 2秒射击一次
  }

  updateBehavior(time, delta) {
    if (time > this.lastShot + this.shootInterval) {
      this.shoot();
      this.lastShot = time;
    }
  }

  shoot() {
    // 安全检查：确保 scene 存在且敌人未被销毁
    if (!this.scene || !this.active) return;

    this.scene.events.emit('enemy-shoot', {
      x: this.x,
      y: this.y + 15,
      velocityY: 200
    });
  }
}

/**
 * 追踪敌机
 */
export class TrackerEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'TRACKER');
  }

  updateBehavior(time, delta) {
    // 追踪玩家
    const player = this.scene.player;
    if (player && player.active) {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        player.x, player.y
      );

      this.scene.physics.velocityFromRotation(
        angle,
        this.baseSpeed,
        this.body.velocity
      );
    }
  }
}
