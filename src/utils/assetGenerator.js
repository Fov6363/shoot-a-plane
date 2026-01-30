// src/utils/assetGenerator.js

/**
 * 生成临时的像素风格图形资源
 * 用于在没有美术资源时快速开发
 */
export class AssetGenerator {
  /**
   * 创建像素风格飞机
   */
  static createPlayerSprite(scene, x, y) {
    const graphics = scene.add.graphics();

    // 主体颜色 - 绿色
    graphics.fillStyle(0x00ff00, 1);

    // 机身主体（细长的矩形）
    graphics.fillRect(-8, -20, 16, 50);

    // 机头（尖锐的三角形）
    graphics.fillTriangle(0, -40, -10, -20, 10, -20);

    // 左机翼
    graphics.fillRect(-35, 5, 27, 12);
    graphics.fillTriangle(-35, 5, -40, 10, -35, 17);

    // 右机翼
    graphics.fillRect(8, 5, 27, 12);
    graphics.fillTriangle(35, 5, 40, 10, 35, 17);

    // 尾翼（小三角形）
    graphics.fillRect(-6, 30, 12, 8);
    graphics.fillTriangle(-15, 35, -6, 30, -6, 38);
    graphics.fillTriangle(15, 35, 6, 30, 6, 38);

    // 驾驶舱窗口（深色）
    graphics.fillStyle(0x004400, 1);
    graphics.fillRect(-5, -15, 10, 12);

    // 引擎喷口（亮色装饰）
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(-5, 32, 4, 4);
    graphics.fillRect(1, 32, 4, 4);

    // 生成纹理（稍微大一点的画布）
    graphics.generateTexture('player', 80, 80);
    graphics.destroy();

    return scene.add.sprite(x, y, 'player');
  }

  /**
   * 创建敌人飞机精灵
   */
  static createEnemySprite(scene, color = 0xff0000) {
    const graphics = scene.add.graphics();

    // 主体颜色 - 红色
    graphics.fillStyle(color, 1);

    // 机身主体（倒置）
    graphics.fillRect(-8, -30, 16, 50);

    // 机头（朝下的三角形）
    graphics.fillTriangle(0, 40, -10, 20, 10, 20);

    // 左机翼
    graphics.fillRect(-35, -5, 27, 12);
    graphics.fillTriangle(-35, -5, -40, 0, -35, 7);

    // 右机翼
    graphics.fillRect(8, -5, 27, 12);
    graphics.fillTriangle(35, -5, 40, 0, 35, 7);

    // 尾翼（朝上）
    graphics.fillRect(-6, -32, 12, 8);
    graphics.fillTriangle(-15, -28, -6, -32, -6, -24);
    graphics.fillTriangle(15, -28, 6, -32, 6, -24);

    // 驾驶舱（深色）
    graphics.fillStyle(0x440000, 1);
    graphics.fillRect(-5, 5, 10, 12);

    // 武器装饰（暗色）
    graphics.fillStyle(0xaa0000, 1);
    graphics.fillRect(-5, -28, 4, 4);
    graphics.fillRect(1, -28, 4, 4);

    graphics.generateTexture('enemy', 80, 80);
    graphics.destroy();
  }

  /**
   * 创建子弹精灵
   */
  static createBulletSprite(scene, key, color) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 8, 20);

    graphics.generateTexture(key, 8, 20);
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
   * 创建BOSS飞船精灵
   */
  static createBossSprite(scene) {
    const graphics = scene.add.graphics();

    // 主体 - 紫色
    graphics.fillStyle(0xff00ff, 1);

    // 主机身（大型矩形）
    graphics.fillRect(-30, -25, 60, 50);

    // 驾驶舱（中央凸起）
    graphics.fillRect(-15, -35, 30, 15);

    // 左侧机翼/引擎
    graphics.fillRect(-55, -10, 25, 20);
    graphics.fillTriangle(-55, -10, -60, 0, -55, 10);
    // 左引擎装饰
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(-50, -5, 15, 10);

    // 右侧机翼/引擎
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(30, -10, 25, 20);
    graphics.fillTriangle(55, -10, 60, 0, 55, 10);
    // 右引擎装饰
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(35, -5, 15, 10);

    // 机头（下方尖锐）
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillTriangle(0, 40, -20, 25, 20, 25);

    // 驾驶舱窗口（深色）
    graphics.fillStyle(0x440044, 1);
    graphics.fillRect(-10, -30, 20, 10);

    // 武器装饰（黄色）
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(-20, -10, 4);
    graphics.fillCircle(20, -10, 4);
    graphics.fillCircle(-20, 10, 4);
    graphics.fillCircle(20, 10, 4);

    graphics.generateTexture('boss', 120, 80);
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
