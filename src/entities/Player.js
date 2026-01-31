// src/entities/Player.js

import { GAME_CONFIG } from '../config/gameConfig.ts';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 缩放到合适大小
    this.setScale(0.5);

    // 物理属性
    this.setCollideWorldBounds(true);
    this.setDrag(400);

    // 玩家属性
    this.hp = GAME_CONFIG.PLAYER.INITIAL_HP;
    this.maxHp = GAME_CONFIG.PLAYER.INITIAL_HP;
    this.speed = GAME_CONFIG.PLAYER.INITIAL_SPEED;
    this.fireRate = GAME_CONFIG.PLAYER.FIRE_RATE;
    this.bulletSpeed = GAME_CONFIG.PLAYER.BULLET_SPEED;
    this.damage = GAME_CONFIG.PLAYER.BULLET_DAMAGE;

    // 射击计时器
    this.lastFired = 0;

    // 无敌帧
    this.invincible = false;
    this.invincibleTime = 0;

    // 升级数据
    this.upgrades = [];

    // 特殊效果标志
    this.hasMagnet = false;
    this.hasLifesteal = false;

    // 连击增伤系统
    this.comboDamageLevel = 0;
    this.comboDamageBonus = 0; // 每次连击的伤害加成
    this.currentCombo = 0; // 当前连击数
    this.lastHitTarget = null; // 上次击中的目标
    this.comboResetTimer = 0; // 连击重置计时器
  }

  /**
   * 移动控制
   */
  move(directionX, directionY) {
    const velocity = new Phaser.Math.Vector2(directionX, directionY);
    velocity.normalize();
    velocity.scale(this.speed);

    this.setVelocity(velocity.x, velocity.y);
  }

  /**
   * 停止移动
   */
  stop() {
    this.setVelocity(0, 0);
  }

  /**
   * 射击
   */
  shoot(time) {
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }

  /**
   * 受伤
   */
  takeDamage(amount = 1) {
    if (this.invincible) return false;

    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.onDeath();
      return true;
    }

    // 受伤无敌帧
    this.startInvincibility(1000);
    return false;
  }

  /**
   * 治疗
   */
  heal(amount = 1) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  /**
   * 开始无敌时间
   */
  startInvincibility(duration) {
    this.invincible = true;
    this.invincibleTime = duration;

    // 闪烁效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: duration / 200
    });
  }

  /**
   * 死亡处理
   */
  onDeath() {
    this.scene.events.emit('player-died');
  }

  /**
   * 添加升级
   */
  addUpgrade(upgrade) {
    this.upgrades.push(upgrade);
    this.applyUpgrade(upgrade);
  }

  /**
   * 应用升级效果
   */
  applyUpgrade(upgrade) {
    switch(upgrade.type) {
      case 'damage':
        this.damage *= (1 + upgrade.value);
        break;
      case 'fire-rate':
        this.fireRate *= (1 - upgrade.value);
        break;
      case 'speed':
        this.speed *= (1 + upgrade.value);
        break;
      case 'max-hp':
        this.maxHp += upgrade.value;
        this.hp += upgrade.value;
        break;
    }
  }

  /**
   * 更新
   */
  update(time, delta) {
    // 无敌时间倒计时
    if (this.invincible) {
      this.invincibleTime -= delta;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
        this.setAlpha(1);
      }
    }

    // 连击重置计时（2秒未击中则重置）
    if (this.currentCombo > 0) {
      this.comboResetTimer += delta;
      if (this.comboResetTimer > 2000) {
        this.resetCombo();
      }
    }
  }

  /**
   * 记录击中目标（用于连击系统）
   */
  onHitTarget(target) {
    if (!this.comboDamageLevel) return this.damage;

    // 检查是否是同一目标
    if (this.lastHitTarget === target) {
      this.currentCombo++;
    } else {
      this.currentCombo = 1;
      this.lastHitTarget = target;
    }

    // 重置计时器
    this.comboResetTimer = 0;

    // 计算连击伤害
    const comboBonus = this.currentCombo * this.comboDamageBonus;
    const finalDamage = this.damage * (1 + comboBonus);

    return finalDamage;
  }

  /**
   * 重置连击
   */
  resetCombo() {
    this.currentCombo = 0;
    this.lastHitTarget = null;
    this.comboResetTimer = 0;
  }
}
