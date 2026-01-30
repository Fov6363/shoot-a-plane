// src/scenes/UpgradeScene.js

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

    // 显示3个升级卡片
    this.createUpgradeCards();
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

    // 数字键提示
    const keyHint = this.add.text(0, height / 2 - 30, `[${index + 1}]`, {
      fontSize: '20px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    keyHint.setOrigin(0.5);

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

    // 键盘快捷键
    this.input.keyboard.on(`keydown-${index + 1}`, () => {
      this.selectUpgrade(upgrade.id);
    });
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
    this.input.keyboard.removeAllListeners();

    // 通知游戏场景
    this.scene.get('GameScene').events.emit('upgrade-selected', upgradeId);
  }
}
