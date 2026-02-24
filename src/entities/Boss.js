// src/entities/Boss.js

import { GAME_CONFIG } from '../config/gameConfig.ts';
import { TrackerEnemy } from './Enemy.js';

// ─── 基类 ───
export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, stage, bossType) {
    const textureKey = `boss-${bossType}`;
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.8);

    this.stage = stage;
    this.bossType = bossType;

    // 循环轮次（第几圈），用于数值强化
    this.cycle = Math.floor((stage - 1) / 5);

    // 阶段配置
    const stageConf = GAME_CONFIG.BOSS.STAGES[bossType - 1];
    this.bossName = stageConf.name;

    // 血量：基础 + 每阶段递增 + 循环轮次额外加成
    this.maxHp = GAME_CONFIG.BOSS.BASE_HP
      + GAME_CONFIG.BOSS.HP_PER_STAGE * (stage - 1)
      + this.cycle * 200;
    this.hp = this.maxHp;

    this.scoreValue = GAME_CONFIG.BOSS.BASE_SCORE * stage;
    this.xpValue = GAME_CONFIG.EXPERIENCE.BOSS_XP;
    this.goldValue = GAME_CONFIG.GOLD.BOSS_BASE_GOLD + GAME_CONFIG.GOLD.BOSS_GOLD_PER_STAGE * stage;

    // 移动参数（循环轮次微调）
    const cycleMult = 1 + this.cycle * 0.15;
    this.moveSpeed = stageConf.moveSpeed * cycleMult;
    this.moveDirection = 1;
    this.moveRange = 200;
    this.startX = x;

    // 攻击参数
    this.shootTimer = 0;
    this.shootInterval = Math.max(400, stageConf.shootInterval / cycleMult);
    this.bulletSpeed = stageConf.bulletSpeed * cycleMult;

    // 特殊能力计时器
    this.specialTimer = 0;

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

  takeDamage(amount) {
    // 护盾期间免疫伤害
    if (this.shieldActive) {
      this.setTint(0xffdd44);
      this.scene.time.delayedCall(50, () => { if (this.active) this.clearTint(); });
      return false;
    }

    this.hp -= amount;

    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    this.scene.events.emit('boss-hp-changed', {
      hp: this.hp,
      maxHp: this.maxHp,
      progress: Math.max(0, this.hp / this.maxHp)
    });

    if (this.hp <= 0) {
      this.onDeath();
      return true;
    }
    return false;
  }

  onDeath() {
    this.scene.events.emit('boss-killed', {
      x: this.x,
      y: this.y,
      xp: this.xpValue,
      score: this.scoreValue,
      gold: this.goldValue,
      stage: this.stage
    });

    // 先创建爆炸（需要 scene 引用），再销毁自身
    const scene = this.scene;
    const bossType = this.bossType;
    const bx = this.x;
    const by = this.y;
    this.destroy();

    // 使用存储的引用创建爆炸
    for (let i = 0; i < 20; i++) {
      const particles = scene.add.particles(
        bx + Phaser.Math.Between(-40, 40),
        by + Phaser.Math.Between(-40, 40),
        `boss-${bossType}`,
        {
          speed: { min: 100, max: 300 },
          scale: { start: 1, end: 0 },
          tint: [0xff0000, 0xff9900, 0xffff00],
          lifespan: 500,
          quantity: 5,
          blendMode: 'ADD'
        }
      );

      scene.time.delayedCall(500, () => {
        particles.destroy();
      });
    }
  }

  createExplosion() {
    const textureKey = `boss-${this.bossType}`;
    for (let i = 0; i < 20; i++) {
      const particles = this.scene.add.particles(
        this.x + Phaser.Math.Between(-40, 40),
        this.y + Phaser.Math.Between(-40, 40),
        textureKey,
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

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.updateMovement(delta);
    this.updateShooting(time, delta);
    this.updateSpecial(time, delta);
  }

  updateMovement(delta) {
    this.x += this.moveSpeed * this.moveDirection * (delta / 1000);

    if (this.x < this.startX - this.moveRange) {
      this.x = this.startX - this.moveRange;
      this.moveDirection = 1;
    } else if (this.x > this.startX + this.moveRange) {
      this.x = this.startX + this.moveRange;
      this.moveDirection = -1;
    }
  }

  updateShooting(time, delta) {
    this.shootTimer += delta;
    if (this.shootTimer >= this.shootInterval) {
      this.shoot();
      this.shootTimer = 0;
    }
  }

  // 子类覆盖
  shoot() {}

  // 子类覆盖
  updateSpecial(time, delta) {}

  // 工具：向指定角度发射子弹
  emitBullet(angle, speed) {
    this.scene.events.emit('boss-shoot', {
      x: this.x,
      y: this.y + 25,
      angle,
      speed: speed || this.bulletSpeed
    });
  }

  // 工具：瞄准玩家角度（角度制）
  angleToPlayer() {
    const player = this.scene.player;
    if (!player || !player.active) return 90;
    const rad = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    return Phaser.Math.RadToDeg(rad);
  }
}

// ─── Stage 1: 红色突击者 ───
export class StrikerBoss extends Boss {
  constructor(scene, x, y, stage) {
    super(scene, x, y, stage, 1);
    this.shotPattern = 0;
  }

  shoot() {
    switch (this.shotPattern) {
      case 0:
        // 三路直射
        [-15, 0, 15].forEach(a => this.emitBullet(90 + a));
        break;
      case 1:
        // 五路扇形
        [-30, -15, 0, 15, 30].forEach(a => this.emitBullet(90 + a, this.bulletSpeed * 0.9));
        break;
      case 2:
        // 瞄准射击
        this.emitBullet(this.angleToPlayer(), this.bulletSpeed * 1.2);
        break;
    }
    this.shotPattern = (this.shotPattern + 1) % 3;
  }
}

// ─── Stage 2: 蓝色风暴（环形弹幕） ───
export class StormBoss extends Boss {
  constructor(scene, x, y, stage) {
    super(scene, x, y, stage, 2);
    this.ringAngle = 0; // 环形弹幕起始偏移
    this.enraged = false;
  }

  shoot() {
    const baseCount = 10;
    const count = this.enraged ? baseCount * 2 : baseCount;
    const step = 360 / count;

    for (let i = 0; i < count; i++) {
      this.emitBullet(this.ringAngle + step * i, this.bulletSpeed);
    }
    // 每次旋转偏移一点
    this.ringAngle += 15;
  }

  updateSpecial(time, delta) {
    if (!this.enraged && this.hp / this.maxHp < 0.5) {
      this.enraged = true;
      // 视觉提示：闪烁
      this.scene.tweens.add({
        targets: this,
        alpha: 0.4,
        duration: 150,
        yoyo: true,
        repeat: 5,
        onComplete: () => { if (this.active) this.setAlpha(1); }
      });
    }
  }
}

// ─── Stage 3: 绿色猎手（追踪型） ───
export class HunterBoss extends Boss {
  constructor(scene, x, y, stage) {
    super(scene, x, y, stage, 3);
    this.burstCount = 0; // 连续瞄准弹计数
    this.summonTimer = 0;
    this.summonInterval = 8000;
  }

  // 缓慢跟踪玩家 X 轴
  updateMovement(delta) {
    const player = this.scene.player;
    if (player && player.active) {
      const dx = player.x - this.x;
      const trackSpeed = this.moveSpeed * (delta / 1000);
      if (Math.abs(dx) > 5) {
        this.x += Math.sign(dx) * Math.min(trackSpeed, Math.abs(dx));
      }
    }
    // 限制边界
    const margin = 60;
    const w = this.scene.cameras.main.width;
    this.x = Phaser.Math.Clamp(this.x, margin, w - margin);
  }

  shoot() {
    if (this.burstCount < 3) {
      // 连续 3 发瞄准弹
      this.emitBullet(this.angleToPlayer(), this.bulletSpeed * 1.1);
      this.burstCount++;
    } else {
      // 扇形掩护
      [-40, -20, 0, 20, 40].forEach(a => this.emitBullet(90 + a, this.bulletSpeed * 0.8));
      this.burstCount = 0;
    }
  }

  updateSpecial(time, delta) {
    this.summonTimer += delta;
    if (this.summonTimer >= this.summonInterval) {
      this.summonTimer = 0;
      this.summonMinions();
    }
  }

  summonMinions() {
    // 召唤 2 个追踪小兵
    for (let i = 0; i < 2; i++) {
      const mx = this.x + (i === 0 ? -60 : 60);
      const minion = new TrackerEnemy(this.scene, mx, this.y);
      // 添加到敌人组
      if (this.scene.enemies) {
        this.scene.enemies.add(minion);
      }
    }
    // 召唤视觉提示
    const flash = this.scene.add.circle(this.x, this.y, 50, 0x00cc44, 0.4);
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy()
    });
  }
}

// ─── Stage 4: 金色堡垒（防御型） ───
export class FortressBoss extends Boss {
  constructor(scene, x, y, stage) {
    super(scene, x, y, stage, 4);
    this.crossAngle = 0; // 十字旋转角
    this.shieldTimer = 0;
    this.shieldInterval = 10000; // 每 10 秒开启护盾
    this.shieldActive = false;
    this.shieldGraphics = null;
  }

  shoot() {
    if (this.shieldActive) return; // 护盾期间不射击

    // 十字方向密集弹幕 + 旋转
    const arms = 4;
    const bulletsPerArm = 2;
    for (let a = 0; a < arms; a++) {
      const baseAngle = this.crossAngle + (360 / arms) * a;
      for (let b = 0; b < bulletsPerArm; b++) {
        this.emitBullet(baseAngle + b * 8, this.bulletSpeed * (0.8 + b * 0.2));
      }
    }
    this.crossAngle += 7; // 缓慢旋转
  }

  updateSpecial(time, delta) {
    this.shieldTimer += delta;

    if (this.shieldActive) return;

    if (this.shieldTimer >= this.shieldInterval) {
      this.shieldTimer = 0;
      this.activateShield();
    }
  }

  activateShield() {
    this.shieldActive = true;

    // 闪烁提示（0.5 秒预警）
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        if (!this.active) return;
        this.setAlpha(1);

        // 护盾视觉
        this.shieldGraphics = this.scene.add.circle(this.x, this.y, 60, 0xffaa00, 0.25);
        this.shieldGraphics.setStrokeStyle(3, 0xffdd44, 0.8);
      }
    });

    // 3 秒后关闭护盾
    this.scene.time.delayedCall(3000, () => {
      this.shieldActive = false;
      if (this.shieldGraphics) {
        this.shieldGraphics.destroy();
        this.shieldGraphics = null;
      }
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // 护盾跟随
    if (this.shieldGraphics && this.shieldGraphics.active) {
      this.shieldGraphics.setPosition(this.x, this.y);
    }
  }
}

// ─── Stage 5: 紫色毁灭者（终极） ───
export class DestroyerBoss extends Boss {
  constructor(scene, x, y, stage) {
    super(scene, x, y, stage, 5);
    this.patternIndex = 0;
    this.enraged = false;
    this.teleportTimer = 0;
    this.teleportInterval = 5000;
    this.ringAngle = 0;
    this.crossAngle = 0;
  }

  shoot() {
    // 随机切换弹幕类型
    switch (this.patternIndex) {
      case 0: this.shootThreeWay(); break;
      case 1: this.shootRing(); break;
      case 2: this.shootAimed(); break;
      case 3: this.shootCross(); break;
      case 4: this.shootSpread(); break;
    }
    this.patternIndex = (this.patternIndex + 1) % 5;
  }

  shootThreeWay() {
    [-15, 0, 15].forEach(a => this.emitBullet(90 + a));
  }

  shootRing() {
    const count = 10;
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      this.emitBullet(this.ringAngle + step * i, this.bulletSpeed * 0.9);
    }
    this.ringAngle += 12;
  }

  shootAimed() {
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        if (this.active) this.emitBullet(this.angleToPlayer(), this.bulletSpeed * 1.2);
      });
    }
  }

  shootCross() {
    const arms = 4;
    for (let a = 0; a < arms; a++) {
      const angle = this.crossAngle + (360 / arms) * a;
      this.emitBullet(angle, this.bulletSpeed * 0.85);
    }
    this.crossAngle += 10;
  }

  shootSpread() {
    [-40, -20, 0, 20, 40].forEach(a => this.emitBullet(90 + a, this.bulletSpeed * 0.85));
  }

  updateMovement(delta) {
    // 快速左右
    super.updateMovement(delta);
  }

  updateSpecial(time, delta) {
    // 狂暴检测
    if (!this.enraged && this.hp / this.maxHp < 0.3) {
      this.enraged = true;
      this.shootInterval = Math.max(250, this.shootInterval / 2);
      this.moveSpeed *= 1.5;

      // 狂暴视觉
      this.setTint(0xff00ff);
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 5,
        onComplete: () => { if (this.active) this.setAlpha(1); }
      });
    }

    // 瞬移
    this.teleportTimer += delta;
    if (this.teleportTimer >= this.teleportInterval) {
      this.teleportTimer = 0;
      this.doTeleport();
    }
  }

  doTeleport() {
    const w = this.scene.cameras.main.width;
    // 消失
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        if (!this.active) return;
        this.x = Phaser.Math.Between(80, w - 80);
        // 出现
        this.scene.tweens.add({
          targets: this,
          alpha: 1,
          duration: 200
        });
      }
    });
  }
}

// 工厂函数：根据 bossType 创建对应子类
export function createBoss(scene, x, y, stage, bossType) {
  switch (bossType) {
    case 1: return new StrikerBoss(scene, x, y, stage);
    case 2: return new StormBoss(scene, x, y, stage);
    case 3: return new HunterBoss(scene, x, y, stage);
    case 4: return new FortressBoss(scene, x, y, stage);
    case 5: return new DestroyerBoss(scene, x, y, stage);
    default: return new StrikerBoss(scene, x, y, stage);
  }
}
