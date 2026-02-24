// src/scenes/GameScene.js

import { Player } from '../entities/Player.js';
import { BulletGroup } from '../entities/Bullet.js';
import { InputManager } from '../systems/InputManager.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { EnemySpawner } from '../systems/EnemySpawner.js';
import { BossManager } from '../systems/BossManager.js';
import { GoldSystem } from '../systems/GoldSystem.js';
import { GAME_CONFIG } from '../config/gameConfig.ts';
import { StorageManager } from '../utils/storage.js';
import { NeonBackground } from '../utils/neonBackground.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // 霓虹背景
    this.neonBackground = new NeonBackground(this);

    // 创建玩家
    const { width, height } = this.cameras.main;
    this.player = new Player(this, width / 2, height - 100);

    // 创建输入管理器
    this.inputManager = new InputManager(this);

    // 创建子弹组
    this.playerBullets = new BulletGroup(this, 'bullet', 50);
    this.enemyBullets = new BulletGroup(this, 'enemy-bullet', 100);

    // 创建敌人组（必须在这里创建，以便正确设置碰撞检测）
    this.enemies = this.physics.add.group();

    // 创建BOSS组
    this.bosses = this.physics.add.group();

    // 创建系统
    this.experienceSystem = new ExperienceSystem(this);
    this.upgradeSystem = new UpgradeSystem(this);
    this.enemySpawner = new EnemySpawner(this, this.enemies);
    this.bossManager = new BossManager(this, this.bosses);
    this.goldSystem = new GoldSystem(this);

    // 游戏状态
    this.score = 0;
    this.gameOver = false;

    // 叠加场景事件队列
    this.isOverlayActive = false;
    this.pendingEvents = []; // { type: 'upgrade'|'shop', data }

    // 无人机计时器
    this.droneTimer = 0;

    // 过载脉冲计时器
    this.overchargeTimer = 0;

    // 时间锚点状态
    this.timeAnchorData = null;
    this.timeAnchorTimer = 0;

    // 设置碰撞
    this.setupCollisions();

    // 设置事件监听
    this.setupEvents();

    // 设置主动技能按键
    this.setupAbilityKeys();

    // 触屏检测
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 创建UI
    this.createUI();

    // 触屏设备创建技能虚拟按钮
    if (this.isTouchDevice) {
      this.createTouchSkillButtons();
      // 注册技能按钮列表给 InputManager，让它过滤这些区域的触摸
      this.inputManager._skillButtons = [this.bombBtn, this.overchargeBtn, this.anchorBtn];
    }

    // 开局送一次技能选择（延迟1秒触发）
    this.time.delayedCall(1000, () => {
      this.events.emit('level-up', 1);
    });
  }

  /**
   * 设置碰撞检测
   */
  setupCollisions() {
    // 玩家子弹 vs 敌人
    this.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.onBulletHitEnemy,
      null,
      this
    );

    // 玩家子弹 vs BOSS
    this.physics.add.overlap(
      this.playerBullets,
      this.bosses,
      this.onBulletHitBoss,
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
      this.enemies,
      this.onEnemyHitPlayer,
      null,
      this
    );

    // BOSS vs 玩家
    this.physics.add.overlap(
      this.player,
      this.bosses,
      this.onEnemyHitPlayer,
      null,
      this
    );

    // 经验球已移除，不再需要碰撞检测
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

    // 商店事件
    this.events.on('open-shop', this.onOpenShop, this);
    this.events.on('shop-closed', this.onShopClosed, this);

    // 接管升级事件（从 UpgradeSystem 转移到 GameScene 管理，加入事件队列）
    // UpgradeSystem 构造时已注册了 level-up 和 upgrade-selected，先移除
    this.events.off('level-up', this.upgradeSystem.onLevelUp, this.upgradeSystem);
    this.events.off('upgrade-selected', this.upgradeSystem.applyUpgrade, this.upgradeSystem);
    // 改由 GameScene 管理
    this.events.on('level-up', this.onLevelUpQueued, this);
    this.events.on('upgrade-selected', this.onUpgradeSelected, this);
  }

  /**
   * 设置主动技能按键
   */
  setupAbilityKeys() {
    // B 键 - 全屏炸弹
    this.input.keyboard.on('keydown-B', () => {
      this.useBomb();
    });

    // Q 键 - 过载脉冲
    this.input.keyboard.on('keydown-Q', () => {
      this.useOvercharge();
    });

    // E 键 - 时间锚点
    this.input.keyboard.on('keydown-E', () => {
      this.useTimeAnchor();
    });
  }

  /**
   * 升级事件（带队列）
   */
  onLevelUpQueued(level) {
    if (this.isOverlayActive) {
      this.pendingEvents.push({ type: 'upgrade', data: level });
      return;
    }
    this.openUpgradeScene(level);
  }

  /**
   * 打开升级场景
   */
  openUpgradeScene(level) {
    this.isOverlayActive = true;
    this.scene.pause('GameScene');

    const options = this.upgradeSystem.getUpgradeOptions(3);
    this.scene.launch('UpgradeScene', { options });
    this.scene.bringToTop('UpgradeScene');
  }

  /**
   * 升级选择完成
   */
  onUpgradeSelected(upgradeId) {
    this.upgradeSystem.applyUpgrade(upgradeId);
    // UpgradeSystem.applyUpgrade 会 stop UpgradeScene 和 resume GameScene
    // 但我们需要管理 isOverlayActive
    this.isOverlayActive = false;

    // 处理队列中下一个事件
    this.processNextPendingEvent();
  }

  /**
   * 商店打开事件（带队列）
   */
  onOpenShop() {
    if (this.isOverlayActive) {
      this.pendingEvents.push({ type: 'shop', data: null });
      return;
    }
    this.openShopScene();
  }

  /**
   * 打开商店场景
   */
  openShopScene() {
    this.isOverlayActive = true;
    this.scene.pause('GameScene');

    this.scene.launch('ShopScene', {
      player: this.player,
      goldSystem: this.goldSystem,
    });
    this.scene.bringToTop('ShopScene');
  }

  /**
   * 商店关闭
   */
  onShopClosed() {
    this.scene.stop('ShopScene');
    this.scene.resume('GameScene');
    this.isOverlayActive = false;

    // 处理队列中下一个事件
    this.processNextPendingEvent();
  }

  /**
   * 处理队列中的下一个事件（优先级：upgrade > shop）
   */
  processNextPendingEvent() {
    if (this.pendingEvents.length === 0) return;

    // 排序：upgrade 优先
    this.pendingEvents.sort((a, b) => {
      if (a.type === 'upgrade' && b.type !== 'upgrade') return -1;
      if (a.type !== 'upgrade' && b.type === 'upgrade') return 1;
      return 0;
    });

    const next = this.pendingEvents.shift();

    // 延迟一帧处理，避免同帧冲突
    this.time.delayedCall(100, () => {
      if (next.type === 'upgrade') {
        this.openUpgradeScene(next.data);
      } else if (next.type === 'shop') {
        this.openShopScene();
      }
    });
  }

  /**
   * 创建UI
   */
  createUI() {
    const { width } = this.cameras.main;

    const panelStyle = {
      fillColor: 0x0b1020,
      fillAlpha: 0.65,
      strokeColor: 0x00e5ff,
      strokeAlpha: 0.6,
      strokeWidth: 1
    };

    const leftPanel = this.add.rectangle(12, 12, 220, 86, panelStyle.fillColor, panelStyle.fillAlpha)
      .setOrigin(0, 0);
    leftPanel.setStrokeStyle(panelStyle.strokeWidth, panelStyle.strokeColor, panelStyle.strokeAlpha);

    const rightPanel = this.add.rectangle(width - 232, 12, 220, 78, panelStyle.fillColor, panelStyle.fillAlpha)
      .setOrigin(0, 0);
    rightPanel.setStrokeStyle(panelStyle.strokeWidth, panelStyle.strokeColor, panelStyle.strokeAlpha);

    const textStyle = {
      fontSize: '18px',
      fontFamily: 'monospace',
      fill: '#e6f7ff',
      stroke: '#001018',
      strokeThickness: 3
    };

    // 左上角：生命值
    this.hpText = this.add.text(20, 20, '', {
      ...textStyle,
      fontSize: '20px'
    });

    // 等级和经验条
    this.levelText = this.add.text(20, 50, '', {
      ...textStyle,
      fill: '#00f6ff'
    });

    this.xpBarBg = this.add.rectangle(20, 80, 200, 10, 0x0e2233);
    this.xpBarBg.setOrigin(0, 0);

    this.xpBar = this.add.rectangle(20, 80, 0, 10, 0x00e5ff);
    this.xpBar.setOrigin(0, 0);

    // 右上角：分数、阶段、金币
    this.scoreText = this.add.text(width - 20, 20, '', {
      ...textStyle,
      fontSize: '20px',
      fill: '#ffe14a'
    }).setOrigin(1, 0);

    this.stageText = this.add.text(width - 20, 50, '', {
      ...textStyle,
      fill: '#8fb2ff'
    }).setOrigin(1, 0);

    this.goldText = this.add.text(width - 20, 72, '', {
      ...textStyle,
      fontSize: '16px',
      fill: '#ffd700'
    }).setOrigin(1, 0);

    // 连击显示（屏幕中央偏上）
    this.comboText = this.add.text(width / 2, 100, '', {
      fontSize: '52px',
      fill: '#ff2ad4',
      fontStyle: 'bold',
      stroke: '#120018',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    // BOSS倒计时（顶部居中）
    this.bossTimerText = this.add.text(width / 2, 8, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fill: '#ff6666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    // 技能CD提示（左下角）
    this.abilityCDText = this.add.text(20, this.cameras.main.height - 30, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fill: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // BOSS血条（初始隐藏）
    this.bossHPBar = this.add.group();
    this.createBossHPBar();
  }

  /**
   * 创建触屏技能虚拟按钮
   */
  createTouchSkillButtons() {
    const { width, height } = this.cameras.main;
    const btnSize = 50;
    const margin = 15;
    const baseX = width - margin - btnSize / 2;
    const baseY = height - margin - btnSize / 2;

    // 炸弹按钮
    this.bombBtn = this.createSkillButton(baseX, baseY, 'B', 0xff4444, () => this.useBomb());
    // 过载按钮
    this.overchargeBtn = this.createSkillButton(baseX, baseY - (btnSize + margin), 'Q', 0xff8800, () => this.useOvercharge());
    // 锚点按钮
    this.anchorBtn = this.createSkillButton(baseX, baseY - (btnSize + margin) * 2, 'E', 0x00ffff, () => this.useTimeAnchor());

    // 初始隐藏
    this.setSkillButtonVisible(this.bombBtn, false);
    this.setSkillButtonVisible(this.overchargeBtn, false);
    this.setSkillButtonVisible(this.anchorBtn, false);
  }

  /**
   * 创建单个技能按钮
   */
  createSkillButton(x, y, label, color, callback) {
    const btnSize = 50;
    const circle = this.add.circle(x, y, btnSize / 2, color, 0.35);
    circle.setStrokeStyle(2, color, 0.8);
    circle.setDepth(900);
    circle.setInteractive();

    circle.on('pointerdown', () => {
      callback();
      circle.setFillStyle(color, 0.6);
    });

    circle.on('pointerup', () => {
      circle.setFillStyle(color, 0.35);
    });

    const text = this.add.text(x, y, label, {
      fontSize: '18px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(901);

    return { circle, text };
  }

  /**
   * 设置技能按钮可见性
   */
  setSkillButtonVisible(btn, visible) {
    btn.circle.setVisible(visible);
    btn.text.setVisible(visible);
    if (visible) {
      btn.circle.setInteractive();
    } else {
      btn.circle.disableInteractive();
    }
  }

  /**
   * 更新触屏技能按钮状态
   */
  updateTouchSkillButtons() {
    const p = this.player;

    // 炸弹按钮
    const showBomb = p.bombs > 0;
    this.setSkillButtonVisible(this.bombBtn, showBomb);
    if (showBomb) {
      this.bombBtn.text.setText(`B\n${p.bombs}`);
    }

    // 过载按钮
    const showOvercharge = p.hasOvercharge;
    this.setSkillButtonVisible(this.overchargeBtn, showOvercharge);
    if (showOvercharge) {
      if (p.overchargeActive) {
        this.overchargeBtn.text.setText('Q\n激活');
        this.overchargeBtn.circle.setFillStyle(0xff8800, 0.6);
      } else if (!p.overchargeReady) {
        this.overchargeBtn.text.setText(`Q\n${Math.ceil(p.overchargeCD / 1000)}s`);
        this.overchargeBtn.circle.setFillStyle(0x888888, 0.35);
        this.overchargeBtn.circle.disableInteractive();
      } else {
        this.overchargeBtn.text.setText('Q');
        this.overchargeBtn.circle.setFillStyle(0xff8800, 0.35);
        this.overchargeBtn.circle.setInteractive();
      }
    }

    // 锚点按钮
    const showAnchor = p.hasTimeAnchor;
    this.setSkillButtonVisible(this.anchorBtn, showAnchor);
    if (showAnchor) {
      if (this.timeAnchorData) {
        this.anchorBtn.text.setText('E\n激活');
        this.anchorBtn.circle.setFillStyle(0x00ffff, 0.6);
        this.anchorBtn.circle.disableInteractive();
      } else if (!p.timeAnchorReady) {
        this.anchorBtn.text.setText(`E\n${Math.ceil(p.timeAnchorCD / 1000)}s`);
        this.anchorBtn.circle.setFillStyle(0x888888, 0.35);
        this.anchorBtn.circle.disableInteractive();
      } else {
        this.anchorBtn.text.setText('E');
        this.anchorBtn.circle.setFillStyle(0x00ffff, 0.35);
        this.anchorBtn.circle.setInteractive();
      }
    }
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

    // 金币
    this.goldText.setText(`💰 ${this.goldSystem.getGold()}`);

    // BOSS倒计时
    const timeToNextBoss = this.bossManager.getTimeToNextBoss();
    if (timeToNextBoss > 0) {
      this.bossTimerText.setText(`BOSS ${timeToNextBoss}s`);
      this.bossTimerText.setVisible(true);
      // 最后5秒变亮闪烁
      if (timeToNextBoss <= 5) {
        this.bossTimerText.setFill('#ff0000');
        this.bossTimerText.setFontSize('20px');
      } else {
        this.bossTimerText.setFill('#ff6666');
        this.bossTimerText.setFontSize('16px');
      }
    } else {
      this.bossTimerText.setVisible(false);
    }

    // 技能CD
    this.updateAbilityCDDisplay();

    // 触屏技能按钮更新
    if (this.isTouchDevice) {
      this.updateTouchSkillButtons();
    }
  }

  /**
   * 更新技能CD显示
   */
  updateAbilityCDDisplay() {
    const parts = [];
    const p = this.player;

    if (p.bombs > 0) {
      parts.push(`[B] 炸弹x${p.bombs}`);
    }
    if (p.hasOvercharge) {
      if (p.overchargeActive) {
        parts.push(`[Q] 过载中!`);
      } else if (!p.overchargeReady) {
        parts.push(`[Q] CD ${Math.ceil(p.overchargeCD / 1000)}s`);
      } else {
        parts.push(`[Q] 过载就绪`);
      }
    }
    if (p.hasTimeAnchor) {
      if (this.timeAnchorData) {
        parts.push(`[E] 锚点激活中`);
      } else if (!p.timeAnchorReady) {
        parts.push(`[E] CD ${Math.ceil(p.timeAnchorCD / 1000)}s`);
      } else {
        parts.push(`[E] 锚点就绪`);
      }
    }

    this.abilityCDText.setText(parts.join('  '));
  }

  /**
   * 子弹击中敌人
   */
  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active || !enemy.scene) return;

    // 穿透子弹不销毁，否则正常销毁
    if (!this.player.hasPierce) {
      if (bullet.hit) {
        bullet.hit();
      } else {
        bullet.setActive(false);
        bullet.setVisible(false);
        if (bullet.body) bullet.disableBody();
      }
    }

    // 检查敌人是否有 takeDamage 方法
    if (enemy.takeDamage) {
      // 计算连击伤害（含暴击判定）
      const finalDamage = this.player.onHitTarget(enemy);

      // 显示伤害数字（暴击用红色大号）
      if (this.player._lastHitCrit) {
        this.showCritDamageNumber(enemy.x, enemy.y, Math.floor(finalDamage));
      } else {
        this.showDamageNumber(enemy.x, enemy.y, Math.floor(finalDamage));
      }

      // 更新连击显示
      this.updateComboDisplay();

      const killed = enemy.takeDamage(finalDamage);

      // 吸血效果
      if (killed && this.player.hasLifesteal && Math.random() < 0.1) {
        this.player.heal(1);
      }
    }
  }

  /**
   * 子弹击中BOSS
   */
  onBulletHitBoss(bullet, boss) {
    if (!bullet.active || !boss.active || !boss.scene) return;

    // 穿透子弹不销毁
    if (!this.player.hasPierce) {
      if (bullet.hit) {
        bullet.hit();
      } else {
        bullet.setActive(false);
        bullet.setVisible(false);
        if (bullet.body) bullet.disableBody();
      }
    }

    // 计算连击伤害（含暴击判定）
    const finalDamage = this.player.onHitTarget(boss);

    // 显示伤害数字
    if (this.player._lastHitCrit) {
      this.showCritDamageNumber(boss.x, boss.y, Math.floor(finalDamage));
    } else {
      this.showDamageNumber(boss.x, boss.y, Math.floor(finalDamage));
    }

    // 更新连击显示
    this.updateComboDisplay();

    const killed = boss.takeDamage(finalDamage);

    // 吸血效果
    if (killed && this.player.hasLifesteal && Math.random() < 0.1) {
      this.player.heal(1);
    }
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

    const prevHp = player.hp;
    player.takeDamage(1);

    // 受伤视觉反馈（HP 确实下降时）
    if (player.hp < prevHp) {
      this.showDamageEffect(player);
      if (player.hasRevengeAura) this.triggerRevengeAura();
    }
  }

  /**
   * 敌人撞击玩家
   */
  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active) return;

    const prevHp = player.hp;
    player.takeDamage(1);
    enemy.destroy();

    // 受伤视觉反馈
    if (player.hp < prevHp) {
      this.showDamageEffect(player);
      if (player.hasRevengeAura) this.triggerRevengeAura();
    }
  }

  /**
   * 玩家受伤视觉反馈
   */
  showDamageEffect(player) {
    const { width, height } = this.cameras.main;

    // 强烈屏幕震动
    this.cameras.main.shake(300, 0.02);

    // 红色闪屏（边框式）
    const redOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.35);
    redOverlay.setDepth(999);
    this.tweens.add({
      targets: redOverlay,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => redOverlay.destroy(),
    });

    // 掉血飘字（在玩家头顶显示大号 -1）
    const dmgText = this.add.text(player.x, player.y - 40, `-1 HP`, {
      fontSize: '36px',
      fill: '#ff3333',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1000);
    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => dmgText.destroy(),
    });

    // HP 文字抖动变红
    if (this.hpText) {
      this.hpText.setColor('#ff0000');
      this.hpText.setScale(1.3);
      this.tweens.add({
        targets: this.hpText,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.hpText.setColor('#e6f7ff');
        },
      });
    }

    // 短暂时间冻结（50ms 的 slowmo 感）- 防止叠加
    if (this.time.timeScale === 1) {
      this.time.timeScale = 0.3;
      this.time.delayedCall(80, () => {
        this.time.timeScale = 1;
      });
    }
  }

  /**
   * 敌人被击杀
   */
  onEnemyKilled(data) {
    this.score += data.score;

    // 屏幕震动
    this.cameras.main.shake(100, 0.003);

    // 击杀闪光
    this.createKillFlash();

    // 分数飘字
    this.showScorePopup(data.x, data.y, data.score);

    // 直接获得经验
    this.experienceSystem.addXP(data.xp);

    // 获得金币
    if (data.gold) {
      const actual = this.goldSystem.addGold(data.gold);
      this.showGoldPopup(data.x, data.y, actual);
    }

    // 闪电链
    if (this.player.hasChainLightning) {
      this.triggerChainLightning(data.x, data.y);
    }
  }

  /**
   * BOSS被击杀
   */
  onBossKilled(data) {
    this.score += data.score;

    // 直接获得经验
    this.experienceSystem.addXP(data.xp);

    // 获得金币
    if (data.gold) {
      const actual = this.goldSystem.addGold(data.gold);
      this.showGoldPopup(data.x, data.y, actual);
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

  // ===== 主动技能 =====

  /**
   * 使用全屏炸弹
   */
  useBomb() {
    if (!this.player.bombs || this.player.bombs <= 0) return;

    this.player.bombs--;

    // 白色闪屏
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.5);
    flash.setDepth(1000);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    // 屏幕震动
    this.cameras.main.shake(300, 0.02);

    // 清除所有小怪
    const enemyList = this.enemies.getChildren().slice();
    enemyList.forEach(enemy => {
      if (enemy && enemy.active) {
        enemy.onDeath();
      }
    });
  }

  /**
   * 使用过载脉冲
   */
  useOvercharge() {
    const p = this.player;
    if (!p.hasOvercharge || !p.overchargeReady || p.overchargeActive) return;

    p.overchargeReady = false;
    p.overchargeActive = true;

    // 视觉提示：玩家变色
    p.setTint(0xff8800);

    // 3 秒后恢复
    this.time.delayedCall(3000, () => {
      p.overchargeActive = false;
      p.clearTint();

      // CD 20 秒
      p.overchargeCD = 20000;
    });
  }

  /**
   * 使用时间锚点
   */
  useTimeAnchor() {
    const p = this.player;
    if (!p.hasTimeAnchor || !p.timeAnchorReady || this.timeAnchorData) return;

    p.timeAnchorReady = false;

    // 标记当前位置和 HP
    this.timeAnchorData = {
      x: p.x,
      y: p.y,
      hp: p.hp,
    };

    // 视觉标记：在锚点位置画圈
    const marker = this.add.circle(p.x, p.y, 20, 0x00ffff, 0.3);
    marker.setStrokeStyle(2, 0x00ffff, 0.8);
    this.tweens.add({
      targets: marker,
      scale: 1.5,
      alpha: 0.1,
      duration: 5000,
    });

    // 5 秒后传送回来
    this.time.delayedCall(5000, () => {
      if (this.timeAnchorData && p.active) {
        p.x = this.timeAnchorData.x;
        p.y = this.timeAnchorData.y;
        p.hp = Math.max(p.hp, this.timeAnchorData.hp); // 恢复到标记时的 HP（取更高值）

        // 传送特效
        const flash = this.add.circle(p.x, p.y, 40, 0x00ffff, 0.5);
        this.tweens.add({
          targets: flash,
          scale: 2,
          alpha: 0,
          duration: 500,
          onComplete: () => flash.destroy(),
        });
      }

      marker.destroy();
      this.timeAnchorData = null;

      // CD 30 秒
      p.timeAnchorCD = 30000;
    });
  }

  // ===== 被动技能 =====

  /**
   * 反击力场
   */
  triggerRevengeAura() {
    const p = this.player;
    const radius = 150;

    // 视觉效果：红色脉冲
    const aura = this.add.circle(p.x, p.y, radius, 0xff4444, 0.3);
    aura.setStrokeStyle(2, 0xff0000, 0.8);
    this.tweens.add({
      targets: aura,
      scale: 1.5,
      alpha: 0,
      duration: 400,
      onComplete: () => aura.destroy(),
    });

    // 对周围敌人造成伤害
    const enemyList = this.enemies.getChildren().slice();
    enemyList.forEach(enemy => {
      if (!enemy || !enemy.active) return;
      const dist = Phaser.Math.Distance.Between(p.x, p.y, enemy.x, enemy.y);
      if (dist <= radius && enemy.takeDamage) {
        enemy.takeDamage(50);
      }
    });
  }

  /**
   * 闪电链
   */
  triggerChainLightning(fromX, fromY) {
    // 防止递归（闪电链杀死的敌人不再触发闪电链）
    if (this._chainLightningActive) return;
    this._chainLightningActive = true;

    // 找到最近的敌人
    let nearest = null;
    let minDist = 200; // 最大连锁距离

    const enemyList = this.enemies.getChildren();
    for (const enemy of enemyList) {
      if (!enemy || !enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(fromX, fromY, enemy.x, enemy.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) {
      this._chainLightningActive = false;
      return;
    }

    // 视觉效果：闪电线
    const line = this.add.line(0, 0, fromX, fromY, nearest.x, nearest.y, 0x44aaff, 0.8);
    line.setLineWidth(2);
    line.setOrigin(0, 0);
    this.tweens.add({
      targets: line,
      alpha: 0,
      duration: 200,
      onComplete: () => line.destroy(),
    });

    // 造成 50% HP 伤害
    const damage = Math.max(1, Math.floor(nearest.maxHp * 0.5));
    if (nearest.takeDamage) {
      nearest.takeDamage(damage);
    }

    this._chainLightningActive = false;
  }

  /**
   * 环绕无人机（每 2 秒自动伤害）
   */
  updateOrbitalDrone(delta) {
    if (!this.player.hasOrbitalDrone) return;

    this.droneTimer += delta;
    if (this.droneTimer < 2000) return;
    this.droneTimer = 0;

    const p = this.player;
    const radius = 120;

    // 视觉效果：电弧脉冲
    const pulse = this.add.circle(p.x, p.y, radius, 0x44ff88, 0.15);
    pulse.setStrokeStyle(1, 0x44ff88, 0.6);
    this.tweens.add({
      targets: pulse,
      scale: 1.3,
      alpha: 0,
      duration: 300,
      onComplete: () => pulse.destroy(),
    });

    // 对范围内敌人造成 10 伤害
    const enemyList = this.enemies.getChildren().slice();
    enemyList.forEach(enemy => {
      if (!enemy || !enemy.active) return;
      const dist = Phaser.Math.Distance.Between(p.x, p.y, enemy.x, enemy.y);
      if (dist <= radius && enemy.takeDamage) {
        enemy.takeDamage(10);
      }
    });
  }

  /**
   * 更新主动技能CD
   */
  updateAbilityCooldowns(delta) {
    const p = this.player;

    // 过载脉冲 CD
    if (p.hasOvercharge && !p.overchargeReady && !p.overchargeActive) {
      p.overchargeCD -= delta;
      if (p.overchargeCD <= 0) {
        p.overchargeCD = 0;
        p.overchargeReady = true;
      }
    }

    // 时间锚点 CD
    if (p.hasTimeAnchor && !p.timeAnchorReady && !this.timeAnchorData) {
      p.timeAnchorCD -= delta;
      if (p.timeAnchorCD <= 0) {
        p.timeAnchorCD = 0;
        p.timeAnchorReady = true;
      }
    }
  }

  // ===== 视觉特效 =====

  /**
   * 创建击杀闪光特效
   */
  createKillFlash() {
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.2);
    flash.setDepth(1000);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 100,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * 显示伤害数字
   */
  showDamageNumber(x, y, damage) {
    const text = this.add.text(x, y, `-${damage}`, {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * 显示暴击伤害数字
   */
  showCritDamageNumber(x, y, damage) {
    const text = this.add.text(x, y, `CRIT -${damage}`, {
      fontSize: '40px',
      fill: '#ff4444',
      fontStyle: 'bold',
      stroke: '#ffff00',
      strokeThickness: 3
    }).setOrigin(0.5);

    text.setScale(1.5);
    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * 显示分数飘字
   */
  showScorePopup(x, y, score) {
    const text = this.add.text(x, y, `+${score}`, {
      fontSize: '24px',
      fill: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * 显示金币飘字
   */
  showGoldPopup(x, y, amount) {
    const text = this.add.text(x + 20, y - 10, `+${amount} 💰`, {
      fontSize: '18px',
      fill: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * 更新连击显示
   */
  updateComboDisplay() {
    const combo = this.player.currentCombo;

    if (combo > 1) {
      this.comboText.setText(`${combo}x COMBO!`);
      this.comboText.setAlpha(1);
      this.comboText.setScale(1.5);

      // 停止之前的缓动
      this.tweens.killTweensOf(this.comboText);

      // 弹跳效果
      this.tweens.add({
        targets: this.comboText,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });

      // 渐隐效果（延迟开始）
      this.tweens.add({
        targets: this.comboText,
        alpha: 0.7,
        duration: 500,
        delay: 1000
      });
    } else {
      this.comboText.setAlpha(0);
    }
  }

  /**
   * 更新
   */
  update(time, delta) {
    if (this.gameOver) return;

    if (this.neonBackground) {
      this.neonBackground.update(delta);
    }

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
      // 检查是否有多重射击
      if (this.player.weaponDualShot && this.player.weaponDualShot > 0) {
        // 多重射击 - 根据等级发射多颗子弹（从中间逐渐展开）
        const bulletCount = this.player.weaponDualShot * 2 + 1; // 1级=3颗，10级=21颗

        // 扇形角度随等级递增：1级较小，10级达到100度
        const maxSpreadAngle = 100; // 最大扇形角度
        const spreadAngle = (bulletCount - 1) * (maxSpreadAngle / 20); // 渐进式展开

        const angleStep = bulletCount > 1 ? spreadAngle / (bulletCount - 1) : 0;
        const startAngle = -spreadAngle / 2; // 居中展开

        for (let i = 0; i < bulletCount; i++) {
          const angle = startAngle + angleStep * i;
          const angleRad = Phaser.Math.DegToRad(angle);

          // 计算子弹速度向量
          const velocityX = Math.sin(angleRad) * this.player.bulletSpeed;
          const velocityY = -Math.cos(angleRad) * this.player.bulletSpeed;

          const bullet = this.playerBullets.fireBullet(
            this.player.x,
            this.player.y - 45,
            velocityY,
            this.player.damage
          );

          // 设置横向速度
          if (bullet && bullet.body) {
            bullet.body.velocity.x = velocityX;
          }
        }
      } else {
        // 普通射击 - 单发
        this.playerBullets.fireBullet(
          this.player.x,
          this.player.y - 45,
          -this.player.bulletSpeed,
          this.player.damage
        );
      }
    }

    // 更新敌人生成器（BOSS期间也继续生成小兵）
    this.enemySpawner.update(time, delta);

    // 更新BOSS管理器
    this.bossManager.update(time, delta);

    // 更新被动技能
    this.updateOrbitalDrone(delta);
    this.updateAbilityCooldowns(delta);

    // 更新UI
    this.updateUI();
  }
}
