// src/scenes/GameScene.js

import { Player } from '../entities/Player.js';
import { BulletGroup } from '../entities/Bullet.js';
import { ExperienceOrb } from '../entities/ExperienceOrb.js';
import { InputManager } from '../systems/InputManager.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { EnemySpawner } from '../systems/EnemySpawner.js';
import { BossManager } from '../systems/BossManager.js';
import { GAME_CONFIG } from '../config/gameConfig.ts';
import { AssetGenerator } from '../utils/assetGenerator.js';
import { StorageManager } from '../utils/storage.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('=== GameScene.create() 开始执行 ===');

    // 生成玩家精灵
    AssetGenerator.createPlayerSprite(this, 0, 0);

    // 创建玩家
    const { width, height } = this.cameras.main;
    this.player = new Player(this, width / 2, height - 100);
    console.log('玩家已创建');

    // 创建输入管理器
    this.inputManager = new InputManager(this);

    // 创建子弹组
    this.playerBullets = new BulletGroup(this, 'bullet', 50);
    this.enemyBullets = new BulletGroup(this, 'enemy-bullet', 100);

    // 创建经验球组
    this.xpOrbs = this.add.group();

    // 创建系统
    this.experienceSystem = new ExperienceSystem(this);
    this.upgradeSystem = new UpgradeSystem(this);
    this.enemySpawner = new EnemySpawner(this);
    this.bossManager = new BossManager(this);

    // 游戏状态
    this.score = 0;
    this.gameOver = false;

    // 设置碰撞
    this.setupCollisions();
    console.log('碰撞检测已设置');

    // 设置事件监听
    this.setupEvents();
    console.log('事件监听已设置');

    // 创建UI
    this.createUI();
    console.log('=== GameScene.create() 完成 ===');
  }

  /**
   * 设置碰撞检测
   */
  setupCollisions() {
    // 玩家子弹 vs 敌人
    this.physics.add.overlap(
      this.playerBullets,
      this.enemySpawner.getEnemies(),
      this.onBulletHitEnemy,
      null,
      this
    );

    // 玩家子弹 vs BOSS
    this.physics.add.overlap(
      this.playerBullets,
      null,
      (bullet, boss) => {
        if (boss && boss === this.bossManager.getCurrentBoss()) {
          this.onBulletHitBoss(bullet, boss);
        }
      },
      null,
      this
    );

    // 敌人子弹 vs 玩家
    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      this.onEnemyBulletHitPlayer,
      null,
      this
    );

    // 敌人 vs 玩家
    this.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemies(),
      this.onEnemyHitPlayer,
      null,
      this
    );

    // BOSS vs 玩家
    this.physics.add.overlap(
      this.player,
      null,
      (player, boss) => {
        if (boss && boss === this.bossManager.getCurrentBoss()) {
          this.onEnemyHitPlayer(player, boss);
        }
      },
      null,
      this
    );

    // 玩家 vs 经验球
    this.physics.add.overlap(
      this.player,
      this.xpOrbs,
      this.onPlayerCollectXP,
      null,
      this
    );
  }

  /**
   * 设置事件监听
   */
  setupEvents() {
    // 敌人被击杀
    this.events.on('enemy-killed', this.onEnemyKilled, this);

    // BOSS被击杀
    this.events.on('boss-killed', this.onBossKilled, this);

    // 敌人射击
    this.events.on('enemy-shoot', this.onEnemyShoot, this);

    // BOSS射击
    this.events.on('boss-shoot', this.onBossShoot, this);

    // 清除所有敌人
    this.events.on('clear-all-enemies', () => {
      this.enemySpawner.clearAllEnemies();
    });

    // 玩家死亡
    this.events.on('player-died', this.onPlayerDied, this);

    // 磁铁效果
    this.events.on('upgrade-applied', (data) => {
      if (data.upgradeId === 'magnet') {
        this.player.hasMagnet = true;
      }
    });
  }

  /**
   * 创建UI
   */
  createUI() {
    const { width } = this.cameras.main;

    // 左上角：生命值
    this.hpText = this.add.text(20, 20, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 等级和经验条
    this.levelText = this.add.text(20, 50, '', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    this.xpBarBg = this.add.rectangle(20, 80, 200, 10, 0x333333);
    this.xpBarBg.setOrigin(0, 0);

    this.xpBar = this.add.rectangle(20, 80, 0, 10, 0x00ff00);
    this.xpBar.setOrigin(0, 0);

    // 右上角：分数和阶段
    this.scoreText = this.add.text(width - 20, 20, '', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(1, 0);

    this.stageText = this.add.text(width - 20, 50, '', {
      fontSize: '18px',
      fill: '#888888'
    }).setOrigin(1, 0);

    // BOSS血条（初始隐藏）
    this.bossHPBar = this.add.group();
    this.createBossHPBar();
  }

  /**
   * 创建BOSS血条
   */
  createBossHPBar() {
    const { width } = this.cameras.main;
    const barWidth = 400;
    const barHeight = 20;
    const x = width / 2 - barWidth / 2;
    const y = 30;

    const bg = this.add.rectangle(x, y, barWidth, barHeight, 0x333333);
    bg.setOrigin(0, 0);
    bg.setVisible(false);

    this.bossHPBarFill = this.add.rectangle(x, y, barWidth, barHeight, 0xff0000);
    this.bossHPBarFill.setOrigin(0, 0);
    this.bossHPBarFill.setVisible(false);

    const label = this.add.text(width / 2, y - 10, 'BOSS', {
      fontSize: '16px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5, 1);
    label.setVisible(false);

    this.bossHPBar.addMultiple([bg, this.bossHPBarFill, label]);

    // 监听BOSS血量变化
    this.events.on('boss-hp-changed', (data) => {
      this.updateBossHPBar(data.progress);
    });

    // BOSS生成时显示血条
    this.events.on('boss-spawned', () => {
      this.showBossHPBar();
    });

    // BOSS死亡时隐藏血条
    this.events.on('boss-killed', () => {
      this.hideBossHPBar();
    });
  }

  /**
   * 显示BOSS血条
   */
  showBossHPBar() {
    this.bossHPBar.children.each(child => {
      child.setVisible(true);
    });
  }

  /**
   * 隐藏BOSS血条
   */
  hideBossHPBar() {
    this.bossHPBar.children.each(child => {
      child.setVisible(false);
    });
  }

  /**
   * 更新BOSS血条
   */
  updateBossHPBar(progress) {
    const { width } = this.cameras.main;
    const barWidth = 400;
    this.bossHPBarFill.width = barWidth * progress;
  }

  /**
   * 更新UI
   */
  updateUI() {
    // 生命值
    const hearts = '❤'.repeat(this.player.hp);
    this.hpText.setText(`HP: ${hearts}`);

    // 等级和经验
    const expData = this.experienceSystem.getData();
    this.levelText.setText(`Level ${expData.level}`);
    this.xpBar.width = 200 * expData.progress;

    // 分数
    this.scoreText.setText(`Score: ${this.score}`);

    // 阶段
    const stage = this.bossManager.getStage();
    this.stageText.setText(`Stage: ${stage}`);
  }

  /**
   * 子弹击中敌人
   */
  onBulletHitEnemy(bullet, enemy) {
    console.log('子弹击中敌人！', 'bullet.active:', bullet.active, 'enemy.active:', enemy.active);

    if (!bullet.active || !enemy.active) {
      console.log('子弹或敌人已失活，跳过');
      return;
    }

    console.log('敌人当前HP:', enemy.hp, '子弹伤害:', bullet.damage || 1);

    // 禁用子弹
    if (bullet.hit) {
      bullet.hit();
    } else {
      bullet.setActive(false);
      bullet.setVisible(false);
      if (bullet.body) bullet.disableBody();
    }

    // 检查敌人是否有 takeDamage 方法
    if (enemy.takeDamage) {
      console.log('调用 enemy.takeDamage');
      const killed = enemy.takeDamage(bullet.damage || 1);
      console.log('takeDamage 返回值（是否击杀）:', killed);

      // 吸血效果
      if (killed && this.player.hasLifesteal && Math.random() < 0.1) {
        this.player.heal(1);
      }
    } else {
      console.log('警告：敌人没有 takeDamage 方法！');
    }
  }

  /**
   * 子弹击中BOSS
   */
  onBulletHitBoss(bullet, boss) {
    if (!bullet.active || !boss.active) return;

    // 禁用子弹
    if (bullet.hit) {
      bullet.hit();
    } else {
      bullet.setActive(false);
      bullet.setVisible(false);
      if (bullet.body) bullet.disableBody();
    }

    boss.takeDamage(bullet.damage || 1);
  }

  /**
   * 敌人子弹击中玩家
   */
  onEnemyBulletHitPlayer(player, bullet) {
    if (!bullet.active) return;

    // 禁用子弹
    if (bullet.hit) {
      bullet.hit();
    } else {
      bullet.setActive(false);
      bullet.setVisible(false);
      if (bullet.body) bullet.disableBody();
    }

    player.takeDamage(1);
  }

  /**
   * 敌人撞击玩家
   */
  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active) return;

    player.takeDamage(1);
    enemy.destroy();
  }

  /**
   * 玩家收集经验球
   */
  onPlayerCollectXP(player, orb) {
    orb.collect();
  }

  /**
   * 敌人被击杀
   */
  onEnemyKilled(data) {
    console.log('敌人被击杀，获得分数:', data.score, '当前总分:', this.score);
    this.score += data.score;
    console.log('更新后总分:', this.score);

    // 生成经验球
    const orb = new ExperienceOrb(this, data.x, data.y, data.xp);
    this.xpOrbs.add(orb);
  }

  /**
   * BOSS被击杀
   */
  onBossKilled(data) {
    this.score += data.score;

    // 生成大量经验球
    for (let i = 0; i < 10; i++) {
      const offsetX = Phaser.Math.Between(-50, 50);
      const offsetY = Phaser.Math.Between(-50, 50);
      const orb = new ExperienceOrb(this, data.x + offsetX, data.y + offsetY, data.xp / 10);
      this.xpOrbs.add(orb);
    }
  }

  /**
   * 敌人射击
   */
  onEnemyShoot(data) {
    this.enemyBullets.fireBullet(data.x, data.y, data.velocityY, 1);
  }

  /**
   * BOSS射击
   */
  onBossShoot(data) {
    const bullet = this.enemyBullets.fireBullet(data.x, data.y, 0, 1);
    if (bullet) {
      const angleRad = Phaser.Math.DegToRad(data.angle);
      this.physics.velocityFromRotation(angleRad, data.speed, bullet.body.velocity);
    }
  }

  /**
   * 玩家死亡
   */
  onPlayerDied() {
    if (this.gameOver) return;

    this.gameOver = true;

    // 更新最高分
    StorageManager.updateHighScore(this.score);

    // 延迟跳转到游戏结束场景
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        stage: this.bossManager.getStage()
      });
    });
  }

  /**
   * 更新
   */
  update(time, delta) {
    if (this.gameOver) return;

    // 更新玩家
    this.player.update(time, delta);

    // 更新输入
    const input = this.inputManager.update();

    // 玩家移动
    if (input.x !== 0 || input.y !== 0) {
      this.player.move(input.x, input.y);
    } else {
      this.player.stop();
    }

    // 玩家自动射击
    if (this.player.shoot(time)) {
      const bullet = this.playerBullets.fireBullet(
        this.player.x,
        this.player.y - 45,
        -this.player.bulletSpeed,
        this.player.damage
      );
      console.log('发射子弹！子弹对象:', bullet, '伤害:', this.player.damage);
    }

    // 更新敌人生成器
    if (!this.bossManager.isInBossPhase()) {
      this.enemySpawner.update(time, delta);
    }

    // 更新BOSS管理器
    this.bossManager.update(time, delta);

    // 磁铁效果
    if (this.player.hasMagnet) {
      this.xpOrbs.children.each(orb => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          orb.x, orb.y
        );
        if (distance < 150) {
          orb.attractTo(this.player, 300);
        }
      });
    }

    // 更新UI
    this.updateUI();
  }
}
