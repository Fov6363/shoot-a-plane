// src/entities/Boss.js

import { GAME_CONFIG } from '../config/gameConfig.ts';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, stage) {
    super(scene, x, y, 'boss');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // BOSS 稍大一些
    this.setScale(0.8);

    this.stage = stage;

    // BOSS属性（递增式而非倍数式）
    this.maxHp = GAME_CONFIG.BOSS.BASE_HP + GAME_CONFIG.BOSS.HP_PER_STAGE * (stage - 1);
    this.hp = this.maxHp;
    this.scoreValue = GAME_CONFIG.BOSS.BASE_SCORE * stage;
    this.xpValue = GAME_CONFIG.EXPERIENCE.BOSS_XP;
    this.goldValue = GAME_CONFIG.GOLD.BOSS_BASE_GOLD + GAME_CONFIG.GOLD.BOSS_GOLD_PER_STAGE * stage;

    // 移动参数
    this.moveSpeed = 100;
    this.moveDirection = 1;
    this.moveRange = 200;
    this.startX = x;

    // 攻击参数
    this.shootTimer = 0;
    this.shootInterval = 1500; // 1.5秒射击一次
    this.shotPattern = 0; // 当前攻击模式

    // 设置物理属性
    this.setCollideWorldBounds(true);

    // 入场动画
    this.y = -50;
    scene.tweens.add({
      targets: this,
      y: 100,
      duration: 2000,
      ease: 'Power2'
    });
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

    // 更新血条
    this.scene.events.emit('boss-hp-changed', {
      hp: this.hp,
      maxHp: this.maxHp,
      progress: this.hp / this.maxHp
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
    // 掉落经验和分数
    this.scene.events.emit('boss-killed', {
      x: this.x,
      y: this.y,
      xp: this.xpValue,
      score: this.scoreValue,
      gold: this.goldValue,
      stage: this.stage
    });

    // 爆炸特效
    this.createExplosion();

    this.destroy();
  }

  /**
   * 创建爆炸特效
   */
  createExplosion() {
    for (let i = 0; i < 20; i++) {
      const particles = this.scene.add.particles(
        this.x + Phaser.Math.Between(-40, 40),
        this.y + Phaser.Math.Between(-40, 40),
        'boss',
        {
          speed: { min: 100, max: 300 },
          scale: { start: 1, end: 0 },
          tint: [0xff0000, 0xff9900, 0xffff00],
          lifespan: 500,
          quantity: 5,
          blendMode: 'ADD'
        }
      );

      this.scene.time.delayedCall(500, () => {
        particles.destroy();
      });
    }
  }

  /**
   * 更新
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // 横向移动
    this.updateMovement(delta);

    // 攻击逻辑
    this.updateShooting(time, delta);
  }

  /**
   * 更新移动
   */
  updateMovement(delta) {
    // 左右移动
    this.x += this.moveSpeed * this.moveDirection * (delta / 1000);

    // 边界检测和转向
    if (this.x < this.startX - this.moveRange) {
      this.x = this.startX - this.moveRange;
      this.moveDirection = 1;
    } else if (this.x > this.startX + this.moveRange) {
      this.x = this.startX + this.moveRange;
      this.moveDirection = -1;
    }
  }

  /**
   * 更新射击
   */
  updateShooting(time, delta) {
    this.shootTimer += delta;

    if (this.shootTimer >= this.shootInterval) {
      this.shoot();
      this.shootTimer = 0;

      // 切换攻击模式
      this.shotPattern = (this.shotPattern + 1) % 3;
    }
  }

  /**
   * 射击
   */
  shoot() {
    switch (this.shotPattern) {
      case 0:
        // 三路弹幕
        this.shootThreeWay();
        break;
      case 1:
        // 扇形弹幕
        this.shootSpread();
        break;
      case 2:
        // 瞄准玩家
        this.shootAtPlayer();
        break;
    }
  }

  /**
   * 三路弹幕
   */
  shootThreeWay() {
    const angles = [-15, 0, 15];
    angles.forEach(angle => {
      this.scene.events.emit('boss-shoot', {
        x: this.x,
        y: this.y + 25,
        angle: 90 + angle,
        speed: 200
      });
    });
  }

  /**
   * 扇形弹幕
   */
  shootSpread() {
    const angles = [-30, -15, 0, 15, 30];
    angles.forEach(angle => {
      this.scene.events.emit('boss-shoot', {
        x: this.x,
        y: this.y + 25,
        angle: 90 + angle,
        speed: 180
      });
    });
  }

  /**
   * 瞄准玩家
   */
  shootAtPlayer() {
    const player = this.scene.player;
    if (player && player.active) {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        player.x, player.y
      );

      this.scene.events.emit('boss-shoot', {
        x: this.x,
        y: this.y + 25,
        angle: Phaser.Math.RadToDeg(angle),
        speed: 250
      });
    }
  }
}
