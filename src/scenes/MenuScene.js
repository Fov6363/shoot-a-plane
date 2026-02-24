// src/scenes/MenuScene.js

import { StorageManager } from '../utils/storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 标题
    this.add.text(width / 2, height / 3, '飞机大战', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 3 + 50, 'ROGUELIKE SHOOTER', {
      fontSize: '20px',
      fill: '#888888'
    }).setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
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
    this.add.text(width / 2, height / 2 + 80, `最高分: ${saveData.highScore}`, {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 110, `游戏次数: ${saveData.gamesPlayed}`, {
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

    controls.forEach((text, i) => {
      this.add.text(20, height - 100 + i * 20, text, {
        fontSize: '14px',
        fill: '#666666'
      });
    });
  }
}
