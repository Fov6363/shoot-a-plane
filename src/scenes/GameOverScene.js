// src/scenes/GameOverScene.js

import { StorageManager } from '../utils/storage.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalStage = data.stage || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 获取存档数据
    const saveData = StorageManager.load();
    const isNewHighScore = this.finalScore === saveData.highScore && this.finalScore > 0;

    // 背景
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0, 0);

    // 标题
    this.add.text(width / 2, 100, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 如果刷新了最高分
    if (isNewHighScore) {
      const newRecordText = this.add.text(width / 2, 170, 'NEW HIGH SCORE!', {
        fontSize: '24px',
        fill: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 闪烁效果
      this.tweens.add({
        targets: newRecordText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    // 统计信息
    const statsY = 240;
    const lineHeight = 40;

    this.add.text(width / 2, statsY, '游戏统计', {
      fontSize: '28px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 最终分数
    this.add.text(width / 2, statsY + lineHeight, `最终分数: ${this.finalScore}`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 到达阶段
    this.add.text(width / 2, statsY + lineHeight * 2, `到达阶段: ${this.finalStage}`, {
      fontSize: '20px',
      fill: '#cccccc'
    }).setOrigin(0.5);

    // 最高分
    this.add.text(width / 2, statsY + lineHeight * 3, `最高分: ${saveData.highScore}`, {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 游戏次数
    this.add.text(width / 2, statsY + lineHeight * 4, `总游戏次数: ${saveData.gamesPlayed}`, {
      fontSize: '18px',
      fill: '#888888'
    }).setOrigin(0.5);

    // 按钮区域
    const buttonsY = height - 150;

    // 重新开始按钮
    const restartButton = this.add.text(width / 2 - 100, buttonsY, '重新开始', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#00aa00',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#00ff00', backgroundColor: '#00cc00' });
    });

    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#ffffff', backgroundColor: '#00aa00' });
    });

    restartButton.on('pointerdown', () => {
      StorageManager.incrementGamesPlayed();
      this.scene.start('GameScene');
    });

    // 返回菜单按钮
    const menuButton = this.add.text(width / 2 + 100, buttonsY, '返回菜单', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ fill: '#00ff00', backgroundColor: '#444444' });
    });

    menuButton.on('pointerout', () => {
      menuButton.setStyle({ fill: '#ffffff', backgroundColor: '#333333' });
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 键盘快捷键
    this.input.keyboard.on('keydown-SPACE', () => {
      StorageManager.incrementGamesPlayed();
      this.scene.start('GameScene');
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });

    // 提示文本（触屏设备隐藏）
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      this.add.text(width / 2, height - 50, '[空格] 重新开始    [ESC] 返回菜单', {
        fontSize: '16px',
        fill: '#666666'
      }).setOrigin(0.5);
    }
  }
}
