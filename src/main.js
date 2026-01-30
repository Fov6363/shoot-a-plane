// src/main.js

import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.ts';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.PHYSICS.GRAVITY_Y },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, UpgradeScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
