// src/scenes/MenuScene.js

import { StorageManager } from '../utils/storage.js';
import { GAME_CONFIG } from '../config/gameConfig.ts';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const isP = GAME_CONFIG.IS_PORTRAIT;

    // 标题
    this.add.text(width / 2, isP ? height * 0.2 : height / 3, '飞机大战', {
      fontSize: isP ? '42px' : '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, (isP ? height * 0.2 : height / 3) + 50, 'ROGUELIKE SHOOTER', {
      fontSize: isP ? '18px' : '20px',
      fill: '#888888'
    }).setOrigin(0.5);

    // 开始按钮
    const btnY = isP ? height * 0.45 : height / 2;
    const startButton = this.add.text(width / 2, btnY, '开始游戏', {
      fontSize: isP ? '36px' : '32px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#00ff00' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#ffffff' });
    });

    startButton.on('pointerdown', () => {
      StorageManager.incrementGamesPlayed();
      this.scene.start('GameScene');
    });

    // 最高分显示
    const saveData = StorageManager.load();
    const statsY = isP ? height * 0.6 : height / 2 + 80;
    this.add.text(width / 2, statsY, `最高分: ${saveData.highScore}`, {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(width / 2, statsY + 30, `游戏次数: ${saveData.gamesPlayed}`, {
      fontSize: '16px',
      fill: '#888888'
    }).setOrigin(0.5);

    // 操作说明
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const controls = isTouchDevice
      ? [
          '操作说明:',
          '触屏拖动 - 移动 | 自动射击'
        ]
      : [
          '操作说明:',
          'WASD / 方向键 - 移动',
          '鼠标移动 - 跟随控制',
          '自动射击 | B-炸弹 Q-过载 E-锚点'
        ];

    const controlsY = isP ? height * 0.78 : height - 100;
    controls.forEach((text, i) => {
      this.add.text(isP ? width / 2 : 20, controlsY + i * 22, text, {
        fontSize: '14px',
        fill: '#666666'
      }).setOrigin(isP ? 0.5 : 0, 0);
    });
  }
}
