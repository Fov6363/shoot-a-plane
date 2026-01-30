# 飞机大战 Roguelike 游戏实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个基于Phaser 3的像素风格飞机射击游戏，融合Roguelike升级系统

**Architecture:** 使用Phaser 3游戏框架，Vite作为构建工具。游戏采用场景系统组织，核心系统（输入、升级、生成器等）独立模块化。使用Arcade物理引擎处理碰撞，对象池优化性能。

**Tech Stack:** Phaser 3.80+, Vite 5.0+, JavaScript ES6+, LocalStorage

---

## 阶段 1: 项目基础搭建

### Task 1: 初始化项目结构

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.gitignore`

**Step 1: 创建 package.json**

```json
{
  "name": "shoot-a-plane",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

**Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    port: 3000,
    open: true
  }
});
```

**Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>飞机大战 - Roguelike Shooter</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #1a1a2e;
      font-family: 'Courier New', monospace;
    }
    #game-container {
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 4: 创建 .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
.vscode/
.idea/
```

**Step 5: 安装依赖**

Run: `npm install`
Expected: 依赖安装成功，生成 node_modules 和 package-lock.json

---

### Task 2: 创建游戏配置和入口文件

**Files:**
- Create: `src/main.js`
- Create: `src/config/gameConfig.js`

**Step 1: 创建游戏配置文件**

```javascript
// src/config/gameConfig.js

export const GAME_CONFIG = {
  // 游戏尺寸
  WIDTH: 800,
  HEIGHT: 600,

  // 玩家配置
  PLAYER: {
    INITIAL_HP: 3,
    INITIAL_SPEED: 200,
    FIRE_RATE: 300, // ms
    BULLET_SPEED: 400,
    BULLET_DAMAGE: 1,
  },

  // 经验值配置
  EXPERIENCE: {
    BASE_LEVEL_XP: 100, // 每级需要的基础经验
    SMALL_ENEMY_XP: 10,
    MEDIUM_ENEMY_XP: 25,
    LARGE_ENEMY_XP: 50,
    BOSS_XP: 200,
  },

  // BOSS配置
  BOSS: {
    STAGE_DURATION: 120000, // 2分钟后出BOSS (ms)
    BASE_HP: 500,
    BASE_SCORE: 1000,
  },

  // 难度递增
  DIFFICULTY: {
    SPAWN_RATE_INCREASE: 0.15,
    HP_INCREASE: 0.20,
    BULLET_SPEED_INCREASE: 0.05,
  },

  // 敌人类型
  ENEMY_TYPES: {
    BASIC: { hp: 1, score: 10, xp: 10, speed: 100 },
    SHOOTER: { hp: 2, score: 20, xp: 15, speed: 80 },
    TRACKER: { hp: 3, score: 30, xp: 25, speed: 60 },
    HEAVY: { hp: 5, score: 50, xp: 40, speed: 50 },
    FAST: { hp: 2, score: 40, xp: 30, speed: 200 },
  },

  // 物理配置
  PHYSICS: {
    GRAVITY_Y: 0,
  },

  // 颜色配置（像素风格）
  COLORS: {
    PLAYER: 0x00ff00,
    ENEMY: 0xff0000,
    BULLET: 0xffff00,
    ENEMY_BULLET: 0xff6600,
    XP_ORB: 0x00ffff,
    BOSS: 0xff00ff,
  }
};
```

**Step 2: 创建主入口文件**

```javascript
// src/main.js

import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.js';

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
  scene: [] // 后续添加场景
};

const game = new Phaser.Game(config);
```

**Step 3: 测试运行**

Run: `npm run dev`
Expected: 浏览器打开，显示黑色游戏画布（800x600）

---

## 阶段 2: 临时资源和工具类

### Task 3: 创建临时像素资源生成器

**Files:**
- Create: `src/utils/assetGenerator.js`

**Step 1: 创建资源生成器**

```javascript
// src/utils/assetGenerator.js

/**
 * 生成临时的像素风格图形资源
 * 用于在没有美术资源时快速开发
 */
export class AssetGenerator {
  /**
   * 创建简单的像素飞机
   */
  static createPlayerSprite(scene, x, y) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ff00, 1);

    // 机身 (三角形)
    graphics.fillTriangle(0, -15, -10, 15, 10, 15);

    // 生成纹理
    graphics.generateTexture('player', 20, 30);
    graphics.destroy();

    return scene.add.sprite(x, y, 'player');
  }

  /**
   * 创建敌人精灵
   */
  static createEnemySprite(scene, color = 0xff0000) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);

    // 倒三角形
    graphics.fillTriangle(0, 15, -10, -15, 10, -15);

    graphics.generateTexture('enemy', 20, 30);
    graphics.destroy();
  }

  /**
   * 创建子弹精灵
   */
  static createBulletSprite(scene, key, color) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 4, 10);

    graphics.generateTexture(key, 4, 10);
    graphics.destroy();
  }

  /**
   * 创建经验球精灵
   */
  static createXPOrbSprite(scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(4, 4, 4);

    graphics.generateTexture('xp-orb', 8, 8);
    graphics.destroy();
  }

  /**
   * 创建BOSS精灵
   */
  static createBossSprite(scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff00ff, 1);

    // 大型飞船
    graphics.fillRect(-25, -25, 50, 50);
    graphics.fillTriangle(-30, -25, -30, 25, -40, 0);
    graphics.fillTriangle(30, -25, 30, 25, 40, 0);

    graphics.generateTexture('boss', 80, 50);
    graphics.destroy();
  }

  /**
   * 生成所有临时资源
   */
  static generateAll(scene) {
    this.createEnemySprite(scene);
    this.createBulletSprite(scene, 'bullet', 0xffff00);
    this.createBulletSprite(scene, 'enemy-bullet', 0xff6600);
    this.createXPOrbSprite(scene);
    this.createBossSprite(scene);
  }
}
```

---

### Task 4: 创建本地存储工具

**Files:**
- Create: `src/utils/storage.js`

**Step 1: 创建存储管理器**

```javascript
// src/utils/storage.js

const STORAGE_KEY = 'shoot-a-plane-save';

export class StorageManager {
  /**
   * 获取存档数据
   */
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch (e) {
      console.error('Failed to load save data:', e);
      return this.getDefaultData();
    }
  }

  /**
   * 保存数据
   */
  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save data:', e);
      return false;
    }
  }

  /**
   * 更新最高分
   */
  static updateHighScore(score) {
    const data = this.load();
    if (score > data.highScore) {
      data.highScore = score;
      data.lastPlayed = Date.now();
      this.save(data);
      return true;
    }
    return false;
  }

  /**
   * 增加游戏次数
   */
  static incrementGamesPlayed() {
    const data = this.load();
    data.gamesPlayed++;
    data.lastPlayed = Date.now();
    this.save(data);
  }

  /**
   * 默认数据
   */
  static getDefaultData() {
    return {
      highScore: 0,
      gamesPlayed: 0,
      lastPlayed: null,
    };
  }

  /**
   * 清除所有数据
   */
  static clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
```

---

## 阶段 3: 基础场景实现

### Task 5: 创建 BootScene

**Files:**
- Create: `src/scenes/BootScene.js`
- Modify: `src/main.js`

**Step 1: 创建启动场景**

```javascript
// src/scenes/BootScene.js

import { AssetGenerator } from '../utils/assetGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 创建加载进度条
    this.createLoadingBar();

    // 生成临时像素资源
    AssetGenerator.generateAll(this);

    // 这里后续可以加载真实的图片和音频资源
    // this.load.image('player', 'assets/sprites/player.png');
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
```

**Step 2: 注册场景到游戏配置**

```javascript
// src/main.js (修改)

import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';

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
  scene: [BootScene] // 添加场景
};

const game = new Phaser.Game(config);
```

**Step 3: 测试运行**

Run: `npm run dev`
Expected: 显示"加载中..."和绿色进度条，然后提示找不到MenuScene（正常，下一步创建）

---

### Task 6: 创建 MenuScene

**Files:**
- Create: `src/scenes/MenuScene.js`
- Modify: `src/main.js`

**Step 1: 创建菜单场景**

```javascript
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
    const controls = [
      '操作说明:',
      'WASD / 方向键 - 移动',
      '空格 - 射击',
      '鼠标移动 - 跟随控制'
    ];

    controls.forEach((text, i) => {
      this.add.text(20, height - 100 + i * 20, text, {
        fontSize: '14px',
        fill: '#666666'
      });
    });
  }
}
```

**Step 2: 注册MenuScene**

```javascript
// src/main.js (修改scene数组)

import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';

const config = {
  // ... 其他配置
  scene: [BootScene, MenuScene]
};
```

**Step 3: 测试运行**

Run: `npm run dev`
Expected: 显示菜单界面，标题、开始按钮、最高分、操作说明都正常显示，按钮有hover效果

---

## 阶段 4: 核心游戏实体

### Task 7: 创建玩家实体

**Files:**
- Create: `src/entities/Player.js`

**Step 1: 创建玩家类**

```javascript
// src/entities/Player.js

import { GAME_CONFIG } from '../config/gameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 物理属性
    this.setCollideWorldBounds(true);
    this.setDrag(400);

    // 玩家属性
    this.hp = GAME_CONFIG.PLAYER.INITIAL_HP;
    this.maxHp = GAME_CONFIG.PLAYER.INITIAL_HP;
    this.speed = GAME_CONFIG.PLAYER.INITIAL_SPEED;
    this.fireRate = GAME_CONFIG.PLAYER.FIRE_RATE;
    this.bulletSpeed = GAME_CONFIG.PLAYER.BULLET_SPEED;
    this.damage = GAME_CONFIG.PLAYER.BULLET_DAMAGE;

    // 射击计时器
    this.lastFired = 0;

    // 无敌帧
    this.invincible = false;
    this.invincibleTime = 0;

    // 升级数据
    this.upgrades = [];
  }

  /**
   * 移动控制
   */
  move(directionX, directionY) {
    const velocity = new Phaser.Math.Vector2(directionX, directionY);
    velocity.normalize();
    velocity.scale(this.speed);

    this.setVelocity(velocity.x, velocity.y);
  }

  /**
   * 停止移动
   */
  stop() {
    this.setVelocity(0, 0);
  }

  /**
   * 射击
   */
  shoot(time) {
    if (time > this.lastFired + this.fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }

  /**
   * 受伤
   */
  takeDamage(amount = 1) {
    if (this.invincible) return false;

    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.onDeath();
      return true;
    }

    // 受伤无敌帧
    this.startInvincibility(1000);
    return false;
  }

  /**
   * 治疗
   */
  heal(amount = 1) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  /**
   * 开始无敌时间
   */
  startInvincibility(duration) {
    this.invincible = true;
    this.invincibleTime = duration;

    // 闪烁效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: duration / 200
    });
  }

  /**
   * 死亡处理
   */
  onDeath() {
    this.scene.events.emit('player-died');
  }

  /**
   * 添加升级
   */
  addUpgrade(upgrade) {
    this.upgrades.push(upgrade);
    this.applyUpgrade(upgrade);
  }

  /**
   * 应用升级效果
   */
  applyUpgrade(upgrade) {
    switch(upgrade.type) {
      case 'damage':
        this.damage *= (1 + upgrade.value);
        break;
      case 'fire-rate':
        this.fireRate *= (1 - upgrade.value);
        break;
      case 'speed':
        this.speed *= (1 + upgrade.value);
        break;
      case 'max-hp':
        this.maxHp += upgrade.value;
        this.hp += upgrade.value;
        break;
    }
  }

  /**
   * 更新
   */
  update(time, delta) {
    // 无敌时间倒计时
    if (this.invincible) {
      this.invincibleTime -= delta;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
        this.setAlpha(1);
      }
    }
  }
}
```

---

### Task 8: 创建子弹实体

**Files:**
- Create: `src/entities/Bullet.js`

**Step 1: 创建子弹类**

```javascript
// src/entities/Bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.damage = 1;
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * 发射子弹
   */
  fire(x, y, velocityY, damage = 1) {
    this.enableBody(true, x, y, true, true);
    this.setVelocityY(velocityY);
    this.damage = damage;
    this.setActive(true);
    this.setVisible(true);
  }

  /**
   * 更新
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // 超出屏幕销毁
    if (this.y < -10 || this.y > this.scene.cameras.main.height + 10) {
      this.deactivate();
    }
  }

  /**
   * 命中目标
   */
  hit() {
    this.deactivate();
  }

  /**
   * 停用
   */
  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.disableBody();
  }
}

/**
 * 子弹组（对象池）
 */
export class BulletGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene, texture, maxSize = 50) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Bullet,
      frameQuantity: maxSize,
      active: false,
      visible: false,
      key: texture
    });
  }

  /**
   * 发射一颗子弹
   */
  fireBullet(x, y, velocityY, damage = 1) {
    const bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y, velocityY, damage);
    }
    return bullet;
  }
}
```

---

### Task 9: 创建敌人实体

**Files:**
- Create: `src/entities/Enemy.js`

**Step 1: 创建敌人基类**

```javascript
// src/entities/Enemy.js

import { GAME_CONFIG } from '../config/gameConfig.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const config = GAME_CONFIG.ENEMY_TYPES[type];

    this.enemyType = type;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.scoreValue = config.score;
    this.xpValue = config.xp;
    this.baseSpeed = config.speed;

    this.setVelocityY(this.baseSpeed);
  }

  /**
   * 受伤
   */
  takeDamage(amount) {
    this.hp -= amount;

    // 受伤闪烁
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.hp <= 0) {
      this.onDeath();
      return true;
    }
    return false;
  }

  /**
   * 死亡处理
   */
  onDeath() {
    // 掉落经验球
    this.scene.events.emit('enemy-killed', {
      x: this.x,
      y: this.y,
      xp: this.xpValue,
      score: this.scoreValue
    });

    // 销毁特效
    this.createDeathEffect();

    this.destroy();
  }

  /**
   * 创建死亡特效
   */
  createDeathEffect() {
    const particles = this.scene.add.particles(this.x, this.y, 'enemy', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      tint: 0xff0000,
      lifespan: 300,
      quantity: 8,
      blendMode: 'ADD'
    });

    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }

  /**
   * 更新
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // 超出屏幕销毁
    if (this.y > this.scene.cameras.main.height + 50) {
      this.destroy();
    }

    // 子类特定行为
    this.updateBehavior(time, delta);
  }

  /**
   * 子类覆盖此方法实现特定行为
   */
  updateBehavior(time, delta) {
    // 基础敌人只是直线下落，无特殊行为
  }
}

/**
 * 射击敌机
 */
export class ShooterEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'SHOOTER');
    this.lastShot = 0;
    this.shootInterval = 2000; // 2秒射击一次
  }

  updateBehavior(time, delta) {
    if (time > this.lastShot + this.shootInterval) {
      this.shoot();
      this.lastShot = time;
    }
  }

  shoot() {
    this.scene.events.emit('enemy-shoot', {
      x: this.x,
      y: this.y + 15,
      velocityY: 200
    });
  }
}

/**
 * 追踪敌机
 */
export class TrackerEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'TRACKER');
  }

  updateBehavior(time, delta) {
    // 追踪玩家
    const player = this.scene.player;
    if (player && player.active) {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        player.x, player.y
      );

      this.scene.physics.velocityFromRotation(
        angle,
        this.baseSpeed,
        this.body.velocity
      );
    }
  }
}
```

---

### Task 10: 创建经验球实体

**Files:**
- Create: `src/entities/ExperienceOrb.js`

**Step 1: 创建经验球类**

```javascript
// src/entities/ExperienceOrb.js

export class ExperienceOrb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, xpValue) {
    super(scene, x, y, 'xp-orb');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.xpValue = xpValue;
    this.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );

    // 阻力，让它慢慢停下
    this.setDrag(100);

    // 脉冲动画
    scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 自动销毁时间
    this.lifespan = 10000; // 10秒后消失
    scene.time.delayedCall(this.lifespan, () => {
      if (this.active) {
        this.fadeOut();
      }
    });
  }

  /**
   * 被磁铁吸引
   */
  attractTo(target, speed = 300) {
    this.scene.physics.moveToObject(this, target, speed);
  }

  /**
   * 收集
   */
  collect() {
    this.scene.events.emit('xp-collected', this.xpValue);

    // 收集特效
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy()
    });
  }

  /**
   * 淡出消失
   */
  fadeOut() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => this.destroy()
    });
  }
}
```

---

## 阶段 5: 核心系统实现

### Task 11: 创建输入管理器

**Files:**
- Create: `src/systems/InputManager.js`

**Step 1: 创建输入管理器**

```javascript
// src/systems/InputManager.js

export class InputManager {
  constructor(scene) {
    this.scene = scene;

    // 键盘输入
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 鼠标输入
    this.pointer = scene.input.activePointer;
    this.mouseMode = false;

    // 触屏检测
    this.isTouchDevice = this.detectTouchDevice();

    // 输入状态
    this.inputState = {
      x: 0,
      y: 0,
      shoot: false
    };

    // 鼠标移动监听
    scene.input.on('pointermove', () => {
      this.mouseMode = true;
    });

    // 键盘按下时切回键盘模式
    scene.input.keyboard.on('keydown', () => {
      this.mouseMode = false;
    });
  }

  /**
   * 检测是否为触屏设备
   */
  detectTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 更新输入状态
   */
  update() {
    if (this.mouseMode) {
      this.updateMouseInput();
    } else {
      this.updateKeyboardInput();
    }

    return this.inputState;
  }

  /**
   * 更新键盘输入
   */
  updateKeyboardInput() {
    let x = 0;
    let y = 0;

    // WASD
    if (this.wasd.left.isDown) x = -1;
    if (this.wasd.right.isDown) x = 1;
    if (this.wasd.up.isDown) y = -1;
    if (this.wasd.down.isDown) y = 1;

    // 方向键（覆盖WASD）
    if (this.cursors.left.isDown) x = -1;
    if (this.cursors.right.isDown) x = 1;
    if (this.cursors.up.isDown) y = -1;
    if (this.cursors.down.isDown) y = 1;

    this.inputState.x = x;
    this.inputState.y = y;
    this.inputState.shoot = this.wasd.space.isDown;
  }

  /**
   * 更新鼠标输入
   */
  updateMouseInput() {
    const player = this.scene.player;
    if (!player) {
      this.inputState.x = 0;
      this.inputState.y = 0;
      this.inputState.shoot = false;
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      this.pointer.worldX, this.pointer.worldY
    );

    // 如果距离太近就不移动
    if (distance < 10) {
      this.inputState.x = 0;
      this.inputState.y = 0;
    } else {
      const angle = Phaser.Math.Angle.Between(
        player.x, player.y,
        this.pointer.worldX, this.pointer.worldY
      );

      this.inputState.x = Math.cos(angle);
      this.inputState.y = Math.sin(angle);
    }

    this.inputState.shoot = this.pointer.isDown;
  }

  /**
   * 获取输入状态
   */
  getInput() {
    return this.inputState;
  }
}
```

---

### Task 12: 创建经验值系统

**Files:**
- Create: `src/systems/ExperienceSystem.js`

**Step 1: 创建经验值系统**

```javascript
// src/systems/ExperienceSystem.js

import { GAME_CONFIG } from '../config/gameConfig.js';

export class ExperienceSystem {
  constructor(scene) {
    this.scene = scene;

    this.level = 1;
    this.currentXP = 0;
    this.nextLevelXP = this.calculateNextLevelXP();
    this.xpMultiplier = 1.0;

    // 监听经验值收集
    scene.events.on('xp-collected', this.addXP, this);
  }

  /**
   * 计算下一级所需经验
   */
  calculateNextLevelXP() {
    return GAME_CONFIG.EXPERIENCE.BASE_LEVEL_XP * this.level;
  }

  /**
   * 添加经验值
   */
  addXP(amount) {
    const actualAmount = Math.floor(amount * this.xpMultiplier);
    this.currentXP += actualAmount;

    // 显示经验值获取
    this.scene.events.emit('xp-gained', actualAmount);

    // 检查升级
    if (this.currentXP >= this.nextLevelXP) {
      this.levelUp();
    }
  }

  /**
   * 升级
   */
  levelUp() {
    this.level++;
    this.currentXP -= this.nextLevelXP;
    this.nextLevelXP = this.calculateNextLevelXP();

    // 触发升级事件
    this.scene.events.emit('level-up', this.level);
  }

  /**
   * 设置经验倍率
   */
  setXPMultiplier(multiplier) {
    this.xpMultiplier = multiplier;
  }

  /**
   * 获取升级进度 (0-1)
   */
  getProgress() {
    return this.currentXP / this.nextLevelXP;
  }

  /**
   * 获取当前数据
   */
  getData() {
    return {
      level: this.level,
      currentXP: this.currentXP,
      nextLevelXP: this.nextLevelXP,
      progress: this.getProgress()
    };
  }

  /**
   * 销毁
   */
  destroy() {
    this.scene.events.off('xp-collected', this.addXP, this);
  }
}
```

---

## 后续任务概览

由于完整实现计划过长，以下是剩余主要任务的概要：

### 阶段 6: 升级系统
- Task 13: 创建升级配置 (`src/config/upgrades.js`)
- Task 14: 创建升级系统管理器 (`src/systems/UpgradeSystem.js`)
- Task 15: 创建升级场景UI (`src/scenes/UpgradeScene.js`)

### 阶段 7: 敌人生成系统
- Task 16: 创建敌人生成器 (`src/systems/EnemySpawner.js`)
- Task 17: 创建波次管理

### 阶段 8: BOSS系统
- Task 18: 创建BOSS实体 (`src/entities/Boss.js`)
- Task 19: 创建BOSS管理器 (`src/systems/BossManager.js`)

### 阶段 9: 主游戏场景
- Task 20: 创建GameScene基础结构
- Task 21: 实现碰撞检测
- Task 22: 实现UI显示（HP、分数、等级）
- Task 23: 整合所有系统

### 阶段 10: GameOver场景
- Task 24: 创建GameOverScene
- Task 25: 整合存档系统

### 阶段 11: 优化和完善
- Task 26: 性能优化（对象池完善）
- Task 27: 音效和粒子特效
- Task 28: 移动端适配
- Task 29: 测试和Bug修复

---

**实施策略建议:**

1. **按阶段顺序实施** - 每个阶段完成后测试再进入下一阶段
2. **频繁测试** - 每完成一个Task就运行`npm run dev`测试
3. **先跑通再优化** - 先实现基础功能，后续再优化细节
4. **保持简单** - 遵循YAGNI原则，不过度设计

**下一步行动:**

当前已完成前12个Task的详细步骤，建议先实施这些基础部分，然后根据实际情况调整后续计划。
