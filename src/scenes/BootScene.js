// src/scenes/BootScene.js

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 创建加载进度条
    this.createLoadingBar();

    // 加载 Kenney 太空射击素材
    // 玩家飞机
    this.load.image('player', 'assets/sprites/playerShip1_green.png');

    // 敌人飞机
    this.load.image('enemy', 'assets/sprites/PNG/Enemies/enemyRed1.png');

    // BOSS（使用大型敌机）
    this.load.image('boss', 'assets/sprites/ufoRed.png');

    // 子弹
    this.load.image('bullet', 'assets/sprites/PNG/Lasers/laserBlue01.png');
    this.load.image('enemy-bullet', 'assets/sprites/PNG/Lasers/laserRed01.png');

    // 经验球（使用蓝色星星）
    this.load.image('xp-orb', 'assets/sprites/PNG/Power-ups/powerupBlue_star.png');

    // 粒子效果（使用小圆形）
    this.load.image('particle', 'assets/sprites/PNG/Power-ups/pill_blue.png');
  }

  create() {
    // 资源加载完成，跳转到菜单
    this.scene.start('MenuScene');
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }
}
