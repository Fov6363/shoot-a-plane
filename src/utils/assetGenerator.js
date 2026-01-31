// src/utils/assetGenerator.js

/**
 * 生成临时的像素风格图形资源
 * 用于在没有美术资源时快速开发
 */
export class AssetGenerator {
  /**
   * 创建像素风格飞机 - 增强版
   */
  static createPlayerSprite(scene, x, y) {
    const graphics = scene.add.graphics();

    // 阴影层
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(-7, -18, 14, 48);

    // 机身主体 - 深绿色基底
    graphics.fillStyle(0x00aa00, 1);
    graphics.fillRect(-8, -20, 16, 50);

    // 机身高光层（中央亮条）
    graphics.fillStyle(0x00ff44, 1);
    graphics.fillRect(-3, -18, 6, 46);
    graphics.fillStyle(0x66ff99, 1);
    graphics.fillRect(-2, -16, 4, 42);

    // 机头（锐利三角形）
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(0, -42, -12, -20, 12, -20);
    graphics.fillStyle(0x88ffaa, 1);
    graphics.fillTriangle(0, -42, -6, -24, 6, -24);

    // 左机翼 - 多层设计
    graphics.fillStyle(0x00cc00, 1);
    graphics.fillRect(-38, 5, 30, 14);
    graphics.fillTriangle(-38, 5, -44, 10, -38, 19);
    // 机翼高光
    graphics.fillStyle(0x00ff44, 1);
    graphics.fillRect(-36, 7, 26, 4);
    // 机翼装甲线
    graphics.lineStyle(1, 0x006600, 1);
    graphics.strokeRect(-38, 5, 30, 14);

    // 右机翼 - 多层设计
    graphics.lineStyle(0);
    graphics.fillStyle(0x00cc00, 1);
    graphics.fillRect(8, 5, 30, 14);
    graphics.fillTriangle(38, 5, 44, 10, 38, 19);
    // 机翼高光
    graphics.fillStyle(0x00ff44, 1);
    graphics.fillRect(10, 7, 26, 4);
    // 机翼装甲线
    graphics.lineStyle(1, 0x006600, 1);
    graphics.strokeRect(8, 5, 30, 14);

    // 尾翼（更精致的设计）
    graphics.lineStyle(0);
    graphics.fillStyle(0x00aa00, 1);
    graphics.fillRect(-7, 30, 14, 10);
    graphics.fillTriangle(-18, 36, -7, 30, -7, 40);
    graphics.fillTriangle(18, 36, 7, 30, 7, 40);
    // 尾翼装饰线
    graphics.fillStyle(0x00ff44, 1);
    graphics.fillRect(-5, 32, 10, 2);

    // 驾驶舱窗口（带反光效果）
    graphics.fillStyle(0x003300, 1);
    graphics.fillRect(-6, -15, 12, 14);
    graphics.fillStyle(0x00ffff, 0.6);
    graphics.fillRect(-5, -14, 4, 4);
    graphics.fillRect(1, -12, 4, 4);

    // 引擎喷口（发光效果）
    graphics.fillStyle(0xff8800, 1);
    graphics.fillCircle(-4, 35, 3);
    graphics.fillCircle(4, 35, 3);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(-4, 35, 2);
    graphics.fillCircle(4, 35, 2);

    // 机体装甲线条
    graphics.lineStyle(1, 0x00ff00, 0.5);
    graphics.strokeRect(-8, -20, 16, 50);
    graphics.strokeRect(-6, 0, 12, 20);

    // 武器挂点装饰
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(-12, 12, 2);
    graphics.fillCircle(12, 12, 2);

    // 生成纹理
    graphics.generateTexture('player', 90, 85);
    graphics.destroy();

    return scene.add.sprite(x, y, 'player');
  }

  /**
   * 创建敌人飞机精灵 - 增强版
   */
  static createEnemySprite(scene, color = 0xff0000) {
    const graphics = scene.add.graphics();

    // 阴影层
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(-7, -28, 14, 48);

    // 主体颜色 - 深红色基底
    const darkColor = color - 0x550000;
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(-8, -30, 16, 50);

    // 机身高光
    graphics.fillStyle(color, 1);
    graphics.fillRect(-3, -28, 6, 46);
    const brightColor = color + 0x442200;
    graphics.fillStyle(brightColor, 1);
    graphics.fillRect(-2, -26, 4, 42);

    // 机头（朝下的锐利三角形）
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(0, 42, -12, 20, 12, 20);
    graphics.fillStyle(brightColor, 1);
    graphics.fillTriangle(0, 42, -6, 24, 6, 24);

    // 左机翼 - 三角形锐角设计
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(-38, -5, 30, 14);
    graphics.fillTriangle(-38, -5, -44, 0, -38, 9);
    // 机翼高光
    graphics.fillStyle(color, 1);
    graphics.fillRect(-36, -3, 26, 4);
    // 机翼边缘装饰
    graphics.lineStyle(1, 0x880000, 1);
    graphics.strokeRect(-38, -5, 30, 14);

    // 右机翼 - 三角形锐角设计
    graphics.lineStyle(0);
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(8, -5, 30, 14);
    graphics.fillTriangle(38, -5, 44, 0, 38, 9);
    // 机翼高光
    graphics.fillStyle(color, 1);
    graphics.fillRect(10, -3, 26, 4);
    // 机翼边缘装饰
    graphics.lineStyle(1, 0x880000, 1);
    graphics.strokeRect(8, -5, 30, 14);

    // 尾翼（朝上，更锋利）
    graphics.lineStyle(0);
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(-7, -32, 14, 10);
    graphics.fillTriangle(-18, -28, -7, -32, -7, -22);
    graphics.fillTriangle(18, -28, 7, -32, 7, -22);
    // 尾翼装饰
    graphics.fillStyle(color, 1);
    graphics.fillRect(-5, -30, 10, 2);

    // 驾驶舱（深色带红光）
    graphics.fillStyle(0x220000, 1);
    graphics.fillRect(-6, 5, 12, 14);
    graphics.fillStyle(0xff0000, 0.6);
    graphics.fillRect(-5, 6, 4, 4);
    graphics.fillRect(1, 8, 4, 4);

    // 武器装饰（发光效果）
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(-4, -28, 3);
    graphics.fillCircle(4, -28, 3);
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(-4, -28, 2);
    graphics.fillCircle(4, -28, 2);

    // 机体装甲线条
    graphics.lineStyle(1, color, 0.5);
    graphics.strokeRect(-8, -30, 16, 50);
    graphics.strokeRect(-6, -10, 12, 20);

    // 威胁标识（小红点）
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(-10, 0, 2);
    graphics.fillCircle(10, 0, 2);

    graphics.generateTexture('enemy', 90, 85);
    graphics.destroy();
  }

  /**
   * 创建子弹精灵 - 增强版
   */
  static createBulletSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // 子弹阴影
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(1, 1, 7, 19);

    // 子弹外壳（深色）
    const darkColor = color - 0x444400;
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(0, 0, 8, 20);

    // 子弹高光层
    graphics.fillStyle(color, 1);
    graphics.fillRect(1, 1, 6, 18);

    // 子弹核心（亮色）
    const brightColor = Math.min(color + 0x333300, 0xffffff);
    graphics.fillStyle(brightColor, 1);
    graphics.fillRect(2, 2, 4, 16);

    // 子弹尖端（更亮）
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillRect(3, 1, 2, 4);

    // 能量光晕效果（外围光圈）
    graphics.lineStyle(1, color, 0.4);
    graphics.strokeRect(-1, 4, 10, 12);

    graphics.generateTexture(key, 10, 22);
    graphics.destroy();
  }

  /**
   * 创建经验球精灵 - 增强版（发光宝石效果）
   */
  static createXPOrbSprite(scene) {
    const graphics = scene.add.graphics();

    // 外层光晕（大圆）
    graphics.fillStyle(0x00ffff, 0.3);
    graphics.fillCircle(6, 6, 6);

    // 中层光晕
    graphics.fillStyle(0x00ffff, 0.6);
    graphics.fillCircle(6, 6, 5);

    // 主体（青色宝石）
    graphics.fillStyle(0x00dddd, 1);
    graphics.fillCircle(6, 6, 4);

    // 核心（亮青色）
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(6, 6, 3);

    // 高光点（白色闪光）
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(5, 5, 2);
    graphics.fillCircle(7, 7, 1);

    graphics.generateTexture('xp-orb', 12, 12);
    graphics.destroy();
  }

  /**
   * 创建BOSS飞船精灵 - 增强版
   */
  static createBossSprite(scene) {
    const graphics = scene.add.graphics();

    // 阴影层
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRect(-28, -23, 56, 48);

    // 主机身 - 深紫色基底
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(-30, -25, 60, 50);

    // 机身高光层
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(-28, -23, 56, 46);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillRect(-24, -20, 48, 40);

    // 驾驶舱（中央凸起）- 多层结构
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(-15, -38, 30, 18);
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(-13, -36, 26, 14);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillRect(-11, -34, 22, 10);

    // 装甲板线条
    graphics.lineStyle(2, 0x660066, 1);
    graphics.strokeRect(-30, -25, 60, 50);
    graphics.strokeRect(-15, -38, 30, 18);
    graphics.lineStyle(0);

    // 左侧机翼/引擎 - 更强壮的设计
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(-58, -12, 28, 24);
    graphics.fillTriangle(-58, -12, -64, 0, -58, 12);
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(-56, -10, 24, 20);
    // 左引擎发光核心
    graphics.fillStyle(0xff0088, 1);
    graphics.fillRect(-52, -6, 16, 12);
    graphics.fillStyle(0xff66ff, 1);
    graphics.fillRect(-48, -4, 12, 8);

    // 右侧机翼/引擎
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(30, -12, 28, 24);
    graphics.fillTriangle(58, -12, 64, 0, 58, 12);
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(32, -10, 24, 20);
    // 右引擎发光核心
    graphics.fillStyle(0xff0088, 1);
    graphics.fillRect(36, -6, 16, 12);
    graphics.fillStyle(0xff66ff, 1);
    graphics.fillRect(36, -4, 12, 8);

    // 机头（下方尖锐攻击锋）
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillTriangle(0, 44, -24, 25, 24, 25);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillTriangle(0, 44, -16, 28, 16, 28);

    // 驾驶舱窗口（深紫色带能量光）
    graphics.fillStyle(0x220022, 1);
    graphics.fillRect(-12, -32, 24, 12);
    graphics.fillStyle(0xff00ff, 0.7);
    graphics.fillRect(-10, -30, 8, 4);
    graphics.fillRect(2, -28, 8, 4);

    // 护盾发生器（蓝色圆形）
    graphics.fillStyle(0x00ccff, 1);
    graphics.fillCircle(-22, -15, 5);
    graphics.fillCircle(22, -15, 5);
    graphics.fillStyle(0x88eeff, 1);
    graphics.fillCircle(-22, -15, 3);
    graphics.fillCircle(22, -15, 3);

    // 重型武器挂点（橙红色）
    graphics.fillStyle(0xff4400, 1);
    graphics.fillCircle(-22, 10, 5);
    graphics.fillCircle(22, 10, 5);
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(-22, 10, 3);
    graphics.fillCircle(22, 10, 3);

    // 能量核心（中央发光）
    graphics.fillStyle(0xff00ff, 0.8);
    graphics.fillCircle(0, 0, 8);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(0, 0, 5);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillCircle(0, 0, 3);

    // 装甲细节线条
    graphics.lineStyle(1, 0xff44ff, 0.6);
    graphics.strokeRect(-26, -22, 20, 40);
    graphics.strokeRect(6, -22, 20, 40);

    graphics.generateTexture('boss', 130, 90);
    graphics.destroy();
  }

  /**
   * 创建粒子纹理（用于特效系统）
   */
  static createParticleSprite(scene) {
    const graphics = scene.add.graphics();

    // 创建圆形粒子，带渐变效果
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(4, 4, 3);
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillCircle(4, 4, 2);

    graphics.generateTexture('particle', 8, 8);
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
    this.createParticleSprite(scene);
  }
}
