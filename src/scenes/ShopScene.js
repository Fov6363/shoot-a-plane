// src/scenes/ShopScene.js

import { SHOP_ITEMS, SHOP_CATEGORIES, getShopItemsForDisplay } from '../config/shopItems.js';
import { BUILD_PATH_COLORS, BUILD_PATH_NAMES } from '../config/upgrades.js';
import { GAME_CONFIG } from '../config/gameConfig.ts';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data) {
    this.player = data.player;
    this.goldSystem = data.goldSystem;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.isPortrait = GAME_CONFIG.IS_PORTRAIT;

    // 半透明背景
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    bg.setOrigin(0, 0);

    // 标题
    this.add.text(width / 2, 30, '═══ 商 店 ═══', {
      fontSize: this.isPortrait ? '26px' : '32px',
      fill: '#ffe14a',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 金币显示
    this.goldText = this.add.text(width / 2, 65, '', {
      fontSize: '22px',
      fill: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.updateGoldDisplay();

    // 创建商品卡片
    this.cards = [];
    this.createShopCards();

    // 关闭按钮（可点击）
    const closeBtnBg = this.add.rectangle(width / 2, height - 25, 200, 36, 0x333344, 0.9);
    closeBtnBg.setStrokeStyle(1, 0x666688);
    closeBtnBg.setInteractive({ useHandCursor: true });

    const closeBtnText = this.add.text(width / 2, height - 25, '关闭商店', {
      fontSize: '18px',
      fill: '#cccccc',
    }).setOrigin(0.5);

    closeBtnBg.on('pointerover', () => {
      closeBtnBg.setFillStyle(0x444466, 0.9);
      closeBtnText.setColor('#ffffff');
    });

    closeBtnBg.on('pointerout', () => {
      closeBtnBg.setFillStyle(0x333344, 0.9);
      closeBtnText.setColor('#cccccc');
    });

    closeBtnBg.on('pointerdown', () => {
      this.closeShop();
    });

    // ESC 关闭
    this.input.keyboard.on('keydown-ESC', () => {
      this.closeShop();
    });

    // 监听金币变化刷新显示
    this.scene.get('GameScene').events.on('gold-changed', this.onGoldChanged, this);
  }

  /**
   * 更新金币显示
   */
  updateGoldDisplay() {
    this.goldText.setText(`💰 金币: ${this.goldSystem.getGold()}`);
  }

  /**
   * 金币变化回调
   */
  onGoldChanged() {
    this.updateGoldDisplay();
    this.refreshCards();
  }

  /**
   * 创建商品网格
   */
  createShopCards() {
    const { width } = this.cameras.main;
    const items = getShopItemsForDisplay(this.player);

    const cols = this.isPortrait ? 2 : 3;
    const cardW = this.isPortrait ? Math.round((width - 48) / 2) : 200;
    const cardH = this.isPortrait ? 125 : 115;
    const spacingX = this.isPortrait ? 12 : 16;
    const spacingY = 12;
    const startY = 95;

    const totalW = cols * cardW + (cols - 1) * spacingX;
    const startX = (width - totalW) / 2;

    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + spacingX) + cardW / 2;
      const y = startY + row * (cardH + spacingY) + cardH / 2;

      this.createCard(x, y, cardW, cardH, item);
    });
  }

  /**
   * 创建单个商品卡片
   */
  createCard(x, y, w, h, item) {
    const container = this.add.container(x, y);
    const canAfford = this.goldSystem.canAfford(item.price);
    const soldOut = item.soldOut;

    // 卡片背景
    let bgColor, bgAlpha, strokeColor;
    if (soldOut) {
      bgColor = 0x222222;
      bgAlpha = 0.6;
      strokeColor = 0x444444;
    } else if (!canAfford) {
      bgColor = 0x1a1a2e;
      bgAlpha = 0.5;
      strokeColor = 0x333344;
    } else {
      bgColor = 0x1a2a1a;
      bgAlpha = 0.8;
      strokeColor = 0x44aa44;
    }

    const cardBg = this.add.rectangle(0, 0, w, h, bgColor, bgAlpha);
    cardBg.setStrokeStyle(2, strokeColor);

    // Build 路线色条（左侧 4px）
    const buildColor = item.buildPath ? (BUILD_PATH_COLORS[item.buildPath] || 0x4488ff) : 0x4488ff;
    const buildStrip = this.add.rectangle(-w / 2 + 2, 0, 4, h - 4, buildColor);
    buildStrip.setOrigin(0, 0.5);
    if (soldOut) buildStrip.setAlpha(0.3);

    // Build 路线小标签（右上角）
    const buildName = item.buildPath ? (BUILD_PATH_NAMES[item.buildPath] || '通用') : '通用';
    const buildLabel = this.add.text(w / 2 - 8, -h / 2 + 8, buildName, {
      fontSize: '10px',
      fill: soldOut ? '#444444' : ('#' + buildColor.toString(16).padStart(6, '0')),
    }).setOrigin(1, 0);

    // 商品名称
    const nameColor = soldOut ? '#666666' : '#ffffff';
    const nameText = this.add.text(0, -h / 2 + 18, item.name, {
      fontSize: '16px',
      fill: nameColor,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // 描述
    const descColor = soldOut ? '#555555' : '#aaaaaa';
    const descText = this.add.text(0, -2, item.description, {
      fontSize: '12px',
      fill: descColor,
      align: 'center',
      wordWrap: { width: w - 20 },
    }).setOrigin(0.5);

    // 类型标签 + 库存信息
    const categoryLabel = this.getCategoryLabel(item);
    const catColor = this.getCategoryColor(item.category);
    const catText = this.add.text(-w / 2 + 12, h / 2 - 22, categoryLabel, {
      fontSize: '11px',
      fill: soldOut ? '#444444' : catColor,
    }).setOrigin(0, 0.5);

    // 价格
    const priceColor = soldOut ? '#444444' : (canAfford ? '#ffd700' : '#ff4444');
    const priceStr = soldOut ? '已满' : `💰 ${item.price}`;
    const priceText = this.add.text(w / 2 - 12, h / 2 - 22, priceStr, {
      fontSize: '14px',
      fill: priceColor,
      fontStyle: 'bold',
    }).setOrigin(1, 0.5);

    container.add([cardBg, buildStrip, buildLabel, nameText, descText, catText, priceText]);

    // 交互
    if (!soldOut && canAfford) {
      cardBg.setInteractive({ useHandCursor: true });

      cardBg.on('pointerover', () => {
        cardBg.setFillStyle(0x2a3a2a, 0.9);
        cardBg.setStrokeStyle(2, 0x66ff66);
      });

      cardBg.on('pointerout', () => {
        cardBg.setFillStyle(bgColor, bgAlpha);
        cardBg.setStrokeStyle(2, strokeColor);
      });

      cardBg.on('pointerdown', () => {
        this.purchaseItem(item);
      });
    }

    this.cards.push({ container, item, cardBg, nameText, descText, catText, priceText });
  }

  /**
   * 获取类别标签
   */
  getCategoryLabel(item) {
    let label = '';
    switch (item.category) {
      case SHOP_CATEGORIES.CONSUMABLE: label = '消耗品'; break;
      case SHOP_CATEGORIES.PASSIVE: label = '被动'; break;
      case SHOP_CATEGORIES.ACTIVE: label = '主动'; break;
    }

    // 叠加信息
    if (item.maxStack > 1 && item.maxStack < Infinity) {
      const current = this.getPlayerItemCount(item);
      label += ` ${current}/${item.maxStack}`;
    }

    return label;
  }

  /**
   * 获取玩家已购买的数量
   */
  getPlayerItemCount(item) {
    switch (item.id) {
      case 'bomb': return this.player.bombs || 0;
      case 'reroll-token': return this.player.rerollTokens || 0;
      case 'lucky-coin': return this.player.luckyGoldLevel || 0;
      case 'armor-plate': return this.player.armorPlateLevel || 0;
      default: return 0;
    }
  }

  /**
   * 获取类别颜色
   */
  getCategoryColor(category) {
    switch (category) {
      case SHOP_CATEGORIES.CONSUMABLE: return '#44ccff';
      case SHOP_CATEGORIES.PASSIVE: return '#44ff88';
      case SHOP_CATEGORIES.ACTIVE: return '#ff8844';
      default: return '#ffffff';
    }
  }

  /**
   * 购买商品
   */
  purchaseItem(item) {
    if (!this.goldSystem.canAfford(item.price)) return;

    // 再次检查是否已满
    const shopItem = SHOP_ITEMS[item.id];
    if (shopItem.canBuy && !shopItem.canBuy(this.player)) return;

    // 扣金币
    this.goldSystem.spendGold(item.price);

    // 应用效果
    const gameScene = this.scene.get('GameScene');
    shopItem.apply(this.player, gameScene);

    // 购买动效：闪一下白色
    const { width, height } = this.cameras.main;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.15);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // 刷新商店
    this.rebuildCards();
  }

  /**
   * 刷新卡片状态（不重建）
   */
  refreshCards() {
    // 简单方案：重建所有卡片
    this.rebuildCards();
  }

  /**
   * 重建卡片
   */
  rebuildCards() {
    this.cards.forEach(c => c.container.destroy());
    this.cards = [];
    this.createShopCards();
    this.updateGoldDisplay();
  }

  /**
   * 关闭商店
   */
  closeShop() {
    // 移除事件监听
    this.input.keyboard.removeAllListeners();
    const gameScene = this.scene.get('GameScene');
    gameScene.events.off('gold-changed', this.onGoldChanged, this);

    // 通知 GameScene
    gameScene.events.emit('shop-closed');
  }
}
