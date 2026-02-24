// src/scenes/UpgradeScene.js

import { getRandomUpgrades } from '../config/upgrades.js';

export class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradeScene' });
  }

  init(data) {
    this.upgradeOptions = data.options || [];
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明背景
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    bg.setOrigin(0, 0);

    // 标题
    this.add.text(width / 2, 80, '选择升级', {
      fontSize: '36px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, 'CHOOSE AN UPGRADE', {
      fontSize: '16px',
      fill: '#888888'
    }).setOrigin(0.5);

    // 容器用于方便重建卡片
    this.cardsContainer = this.add.container(0, 0);

    // 显示3个升级卡片
    this.createUpgradeCards();

    // 刷新令牌按钮
    this.createRerollButton();
  }

  /**
   * 创建升级卡片
   */
  createUpgradeCards() {
    const { width, height } = this.cameras.main;
    const cardWidth = 220;
    const cardHeight = 280;
    const spacing = 30;
    const startX = (width - (cardWidth * 3 + spacing * 2)) / 2;
    const cardY = height / 2 + 20;

    // 存储键盘监听器引用以便精确移除
    this._keyListeners = [];

    this.upgradeOptions.forEach((option, index) => {
      const x = startX + (cardWidth + spacing) * index + cardWidth / 2;
      const y = cardY;

      this.createCard(x, y, cardWidth, cardHeight, option, index);
    });
  }

  /**
   * 创建单个升级卡片
   */
  createCard(x, y, width, height, upgrade, index) {
    // 卡片容器
    const container = this.add.container(x, y);

    // 卡片背景
    const bg = this.add.rectangle(0, 0, width, height, 0x333333);
    bg.setStrokeStyle(2, 0x555555);

    // 升级名称
    const title = this.add.text(0, -height / 2 + 40, upgrade.name, {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 20 }
    });
    title.setOrigin(0.5);

    // 升级类型标签
    const typeColor = this.getTypeColor(upgrade.type);
    const typeLabel = this.add.text(0, -height / 2 + 75, this.getTypeLabel(upgrade.type), {
      fontSize: '14px',
      fill: typeColor,
      backgroundColor: '#222222',
      padding: { x: 8, y: 4 }
    });
    typeLabel.setOrigin(0.5);

    // 升级描述
    const desc = this.add.text(0, -10, upgrade.description, {
      fontSize: '16px',
      fill: '#cccccc',
      align: 'center',
      wordWrap: { width: width - 30 }
    });
    desc.setOrigin(0.5);

    // 数字键提示（触屏设备隐藏）
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const keyHint = this.add.text(0, height / 2 - 30, `[${index + 1}]`, {
      fontSize: '20px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    keyHint.setOrigin(0.5);
    if (isTouchDevice) {
      keyHint.setVisible(false);
    }

    container.add([bg, title, typeLabel, desc, keyHint]);

    // 如果有等级信息，也添加到容器
    if (upgrade.currentLevel > 0) {
      const levelText = this.add.text(0, height / 2 - 60, `当前等级: ${upgrade.currentLevel}`, {
        fontSize: '14px',
        fill: '#ffff00'
      });
      levelText.setOrigin(0.5);
      container.add(levelText);
    }

    // 设置交互
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x444444);
      bg.setStrokeStyle(3, 0x00ff00);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x333333);
      bg.setStrokeStyle(2, 0x555555);
    });

    bg.on('pointerdown', () => {
      this.selectUpgrade(upgrade.id);
    });

    // 键盘快捷键（用 once 自动移除，或存储引用）
    const keyHandler = () => {
      this.selectUpgrade(upgrade.id);
    };
    this.input.keyboard.on(`keydown-${index + 1}`, keyHandler);
    this._keyListeners.push({ event: `keydown-${index + 1}`, fn: keyHandler });

    this.cardsContainer.add(container);
  }

  /**
   * 移除已注册的键盘监听器
   */
  removeKeyListeners() {
    if (this._keyListeners) {
      this._keyListeners.forEach(({ event, fn }) => {
        this.input.keyboard.off(event, fn);
      });
      this._keyListeners = [];
    }
    if (this._rerollHandler) {
      this.input.keyboard.off('keydown-R', this._rerollHandler);
      this._rerollHandler = null;
    }
  }

  /**
   * 创建刷新令牌按钮
   */
  createRerollButton() {
    const { width, height } = this.cameras.main;

    // 获取 GameScene 的 player 引用
    const gameScene = this.scene.get('GameScene');
    const player = gameScene ? gameScene.player : null;
    const tokens = player ? (player.rerollTokens || 0) : 0;

    if (tokens <= 0) return;

    // 刷新按钮
    const btnY = height - 50;
    const btnBg = this.add.rectangle(width / 2, btnY, 200, 40, 0x224422, 0.9);
    btnBg.setStrokeStyle(2, 0x44ff44);
    btnBg.setInteractive({ useHandCursor: true });

    this.rerollText = this.add.text(width / 2, btnY, `🔄 刷新选项 (${tokens})`, {
      fontSize: '16px',
      fill: '#44ff44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x336633, 0.9);
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x224422, 0.9);
    });

    btnBg.on('pointerdown', () => {
      this.doReroll(player, btnBg);
    });

    // R 键刷新
    this._rerollHandler = () => {
      this.doReroll(player, btnBg);
    };
    this.input.keyboard.on('keydown-R', this._rerollHandler);

    this.rerollBtn = btnBg;
  }

  /**
   * 执行刷新
   */
  doReroll(player, btnBg) {
    if (!player || player.rerollTokens <= 0) return;

    player.rerollTokens--;

    // 获取新的升级选项
    const gameScene = this.scene.get('GameScene');
    const newOptions = gameScene.upgradeSystem.getUpgradeOptions(3);
    this.upgradeOptions = newOptions;

    // 清除旧卡片
    this.cardsContainer.removeAll(true);
    this.removeKeyListeners();

    // 重建卡片
    this.createUpgradeCards();

    // 更新刷新按钮
    if (player.rerollTokens <= 0) {
      if (btnBg) btnBg.destroy();
      if (this.rerollText) this.rerollText.destroy();
    } else {
      this.rerollText.setText(`🔄 刷新选项 (${player.rerollTokens})`);
      // 重新注册 R 键
      this._rerollHandler = () => {
        this.doReroll(player, btnBg);
      };
      this.input.keyboard.on('keydown-R', this._rerollHandler);
    }
  }

  /**
   * 获取类型颜色
   */
  getTypeColor(type) {
    switch (type) {
      case 'stat': return '#00ff00';
      case 'weapon': return '#ff9900';
      case 'skill': return '#ff00ff';
      default: return '#ffffff';
    }
  }

  /**
   * 获取类型标签
   */
  getTypeLabel(type) {
    switch (type) {
      case 'stat': return '属性';
      case 'weapon': return '武器';
      case 'skill': return '技能';
      default: return '未知';
    }
  }

  /**
   * 选择升级
   */
  selectUpgrade(upgradeId) {
    // 移除键盘监听
    this.removeKeyListeners();

    // 通知游戏场景
    this.scene.get('GameScene').events.emit('upgrade-selected', upgradeId);
  }
}
