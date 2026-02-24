// src/scenes/GameOverScene.js

import { StorageManager } from '../utils/storage.js';
import { GAME_CONFIG } from '../config/gameConfig.ts';

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
    const isP = GAME_CONFIG.IS_PORTRAIT;

    // 获取存档数据
    const saveData = StorageManager.load();
    const isNewHighScore = this.finalScore === saveData.highScore && this.finalScore > 0;

    // 背景
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0, 0);

    // 标题
    this.add.text(width / 2, isP ? 80 : 100, 'GAME OVER', {
      fontSize: isP ? '48px' : '64px',
      fontFamily: 'monospace',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 如果刷新了最高分
    if (isNewHighScore) {
      const newRecordText = this.add.text(width / 2, isP ? 135 : 170, 'NEW HIGH SCORE!', {
        fontSize: isP ? '20px' : '24px',
        fontFamily: 'monospace',
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
    const statsY = isP ? 190 : 240;
    const lineHeight = isP ? 35 : 40;

    this.add.text(width / 2, statsY, '游戏统计', {
      fontSize: isP ? '24px' : '28px',
      fontFamily: 'monospace',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 最终分数
    this.add.text(width / 2, statsY + lineHeight, `最终分数: ${this.finalScore}`, {
      fontSize: isP ? '20px' : '24px',
      fontFamily: 'monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 到达阶段
    this.add.text(width / 2, statsY + lineHeight * 2, `到达阶段: ${this.finalStage}`, {
      fontSize: isP ? '18px' : '20px',
      fontFamily: 'monospace',
      fill: '#cccccc'
    }).setOrigin(0.5);

    // 最高分
    this.add.text(width / 2, statsY + lineHeight * 3, `最高分: ${saveData.highScore}`, {
      fontSize: isP ? '18px' : '20px',
      fontFamily: 'monospace',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 游戏次数
    this.add.text(width / 2, statsY + lineHeight * 4, `总游戏次数: ${saveData.gamesPlayed}`, {
      fontSize: isP ? '16px' : '18px',
      fontFamily: 'monospace',
      fill: '#888888'
    }).setOrigin(0.5);

    // 按钮区域
    if (isP) {
      // 竖屏：按钮纵向排列
      const btn1Y = height - 200;
      const btn2Y = height - 130;

      const restartButton = this.add.text(width / 2, btn1Y, '重新开始', {
        fontSize: '28px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        backgroundColor: '#00aa00',
        padding: { x: 30, y: 12 }
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

      const menuButton = this.add.text(width / 2, btn2Y, '返回菜单', {
        fontSize: '28px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 30, y: 12 }
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
    } else {
      // 横屏：按钮横向排列（原逻辑）
      const buttonsY = height - 150;

      const restartButton = this.add.text(width / 2 - 100, buttonsY, '重新开始', {
        fontSize: '28px',
        fontFamily: 'monospace',
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

      const menuButton = this.add.text(width / 2 + 100, buttonsY, '返回菜单', {
        fontSize: '28px',
        fontFamily: 'monospace',
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
    }

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
        fontFamily: 'monospace',
        fill: '#666666'
      }).setOrigin(0.5);
    }
  }
}
