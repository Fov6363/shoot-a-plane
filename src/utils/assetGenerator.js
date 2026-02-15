// src/utils/assetGenerator.js

/**
 * 生成临时的像素风格图形资源
 * 用于在没有美术资源时快速开发
 */
export class AssetGenerator {
  static safeColorAdd(color, offset) {
    const r = Math.min(0xff, ((color >> 16) & 0xff) + ((offset >> 16) & 0xff));
    const g = Math.min(0xff, ((color >> 8) & 0xff) + ((offset >> 8) & 0xff));
    const b = Math.min(0xff, (color & 0xff) + (offset & 0xff));
    return (r << 16) | (g << 8) | b;
  }

  static safeColorSub(color, offset) {
    const r = Math.max(0, ((color >> 16) & 0xff) - ((offset >> 16) & 0xff));
    const g = Math.max(0, ((color >> 8) & 0xff) - ((offset >> 8) & 0xff));
    const b = Math.max(0, (color & 0xff) - (offset & 0xff));
    return (r << 16) | (g << 8) | b;
  }

  /**
   * 创建像素风格飞机 - 增强版
   */
  static createPlayerSprite(scene, x, y, options = {}) {
    const { addToScene = true } = options;
    const graphics = scene.add.graphics();
    const offsetX = 45; // 中心X偏移
    const offsetY = 42; // 中心Y偏移

    // 阴影层
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(offsetX - 7, offsetY - 18, 14, 48);

    // 机身主体 - 霓虹青蓝基底
    graphics.fillStyle(0x0088cc, 1);
    graphics.fillRect(offsetX - 8, offsetY - 20, 16, 50);

    // 机身高光层（中央亮条）
    graphics.fillStyle(0x00d4ff, 1);
    graphics.fillRect(offsetX - 3, offsetY - 18, 6, 46);
    graphics.fillStyle(0x66e6ff, 1);
    graphics.fillRect(offsetX - 2, offsetY - 16, 4, 42);

    // 机头（锐利三角形）
    graphics.fillStyle(0x00c8ff, 1);
    graphics.fillTriangle(
      offsetX, offsetY - 42,
      offsetX - 12, offsetY - 20,
      offsetX + 12, offsetY - 20
    );
    graphics.fillStyle(0x99f0ff, 1);
    graphics.fillTriangle(
      offsetX, offsetY - 42,
      offsetX - 6, offsetY - 24,
      offsetX + 6, offsetY - 24
    );

    // 左机翼 - 多层设计
    graphics.fillStyle(0x0077aa, 1);
    graphics.fillRect(offsetX - 38, offsetY + 5, 30, 14);
    graphics.fillTriangle(
      offsetX - 38, offsetY + 5,
      offsetX - 44, offsetY + 10,
      offsetX - 38, offsetY + 19
    );
    // 机翼高光
    graphics.fillStyle(0x00d4ff, 1);
    graphics.fillRect(offsetX - 36, offsetY + 7, 26, 4);
    // 机翼装甲线
    graphics.lineStyle(1, 0x004466, 1);
    graphics.strokeRect(offsetX - 38, offsetY + 5, 30, 14);

    // 右机翼 - 多层设计
    graphics.lineStyle(0);
    graphics.fillStyle(0x0077aa, 1);
    graphics.fillRect(offsetX + 8, offsetY + 5, 30, 14);
    graphics.fillTriangle(
      offsetX + 38, offsetY + 5,
      offsetX + 44, offsetY + 10,
      offsetX + 38, offsetY + 19
    );
    // 机翼高光
    graphics.fillStyle(0x00d4ff, 1);
    graphics.fillRect(offsetX + 10, offsetY + 7, 26, 4);
    // 机翼装甲线
    graphics.lineStyle(1, 0x004466, 1);
    graphics.strokeRect(offsetX + 8, offsetY + 5, 30, 14);

    // 尾翼（更精致的设计）
    graphics.lineStyle(0);
    graphics.fillStyle(0x0077aa, 1);
    graphics.fillRect(offsetX - 7, offsetY + 30, 14, 10);
    graphics.fillTriangle(
      offsetX - 18, offsetY + 36,
      offsetX - 7, offsetY + 30,
      offsetX - 7, offsetY + 40
    );
    graphics.fillTriangle(
      offsetX + 18, offsetY + 36,
      offsetX + 7, offsetY + 30,
      offsetX + 7, offsetY + 40
    );
    // 尾翼装饰线
    graphics.fillStyle(0x00d4ff, 1);
    graphics.fillRect(offsetX - 5, offsetY + 32, 10, 2);

    // 驾驶舱窗口（带反光效果）
    graphics.fillStyle(0x001a2a, 1);
    graphics.fillRect(offsetX - 6, offsetY - 15, 12, 14);
    graphics.fillStyle(0x88f6ff, 0.7);
    graphics.fillRect(offsetX - 5, offsetY - 14, 4, 4);
    graphics.fillRect(offsetX + 1, offsetY - 12, 4, 4);

    // 引擎喷口（发光效果）
    graphics.fillStyle(0xffb300, 1);
    graphics.fillCircle(offsetX - 4, offsetY + 35, 3);
    graphics.fillCircle(offsetX + 4, offsetY + 35, 3);
    graphics.fillStyle(0xfff2a6, 1);
    graphics.fillCircle(offsetX - 4, offsetY + 35, 2);
    graphics.fillCircle(offsetX + 4, offsetY + 35, 2);

    // 机体装甲线条
    graphics.lineStyle(1, 0x66e6ff, 0.6);
    graphics.strokeRect(offsetX - 8, offsetY - 20, 16, 50);
    graphics.strokeRect(offsetX - 6, offsetY, 12, 20);

    // 武器挂点装饰
    graphics.fillStyle(0xffcc4d, 1);
    graphics.fillCircle(offsetX - 12, offsetY + 12, 2);
    graphics.fillCircle(offsetX + 12, offsetY + 12, 2);

    // 生成纹理
    graphics.generateTexture('player', 90, 85);
    graphics.destroy();

    if (!addToScene) return null;
    return scene.add.sprite(x, y, 'player');
  }

  /**
   * 创建敌人飞机精灵 - 增强版
   */
  static createEnemySprite(scene, color = 0xff0000) {
    const graphics = scene.add.graphics();
    const offsetX = 45; // 中心X偏移
    const offsetY = 42; // 中心Y偏移

    // 阴影层
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(offsetX - 7, offsetY - 28, 14, 48);

    // 主体颜色 - 深红色基底
    const darkColor = AssetGenerator.safeColorSub(color, 0x550000);
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(offsetX - 8, offsetY - 30, 16, 50);

    // 机身高光
    graphics.fillStyle(color, 1);
    graphics.fillRect(offsetX - 3, offsetY - 28, 6, 46);
    const brightColor = AssetGenerator.safeColorAdd(color, 0x442200);
    graphics.fillStyle(brightColor, 1);
    graphics.fillRect(offsetX - 2, offsetY - 26, 4, 42);

    // 机头（朝下的锐利三角形）
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(offsetX + 0, offsetY + 42, offsetX - 12, offsetY + 20, offsetX + 12, offsetY + 20);
    graphics.fillStyle(brightColor, 1);
    graphics.fillTriangle(offsetX + 0, offsetY + 42, offsetX - 6, offsetY + 24, offsetX + 6, offsetY + 24);

    // 左机翼 - 三角形锐角设计
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(offsetX - 38, offsetY - 5, 30, 14);
    graphics.fillTriangle(offsetX - 38, offsetY - 5, offsetX - 44, offsetY + 0, offsetX - 38, offsetY + 9);
    // 机翼高光
    graphics.fillStyle(color, 1);
    graphics.fillRect(offsetX - 36, offsetY - 3, 26, 4);
    // 机翼边缘装饰
    graphics.lineStyle(1, 0x880000, 1);
    graphics.strokeRect(offsetX - 38, offsetY - 5, 30, 14);

    // 右机翼 - 三角形锐角设计
    graphics.lineStyle(0);
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(offsetX + 8, offsetY - 5, 30, 14);
    graphics.fillTriangle(offsetX + 38, offsetY - 5, offsetX + 44, offsetY + 0, offsetX + 38, offsetY + 9);
    // 机翼高光
    graphics.fillStyle(color, 1);
    graphics.fillRect(offsetX + 10, offsetY - 3, 26, 4);
    // 机翼边缘装饰
    graphics.lineStyle(1, 0x880000, 1);
    graphics.strokeRect(offsetX + 8, offsetY - 5, 30, 14);

    // 尾翼（朝上，更锋利）
    graphics.lineStyle(0);
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(offsetX - 7, offsetY - 32, 14, 10);
    graphics.fillTriangle(offsetX - 18, offsetY - 28, offsetX - 7, offsetY - 32, offsetX - 7, offsetY - 22);
    graphics.fillTriangle(offsetX + 18, offsetY - 28, offsetX + 7, offsetY - 32, offsetX + 7, offsetY - 22);
    // 尾翼装饰
    graphics.fillStyle(color, 1);
    graphics.fillRect(offsetX - 5, offsetY - 30, 10, 2);

    // 驾驶舱（深色带红光）
    graphics.fillStyle(0x220000, 1);
    graphics.fillRect(offsetX - 6, offsetY + 5, 12, 14);
    graphics.fillStyle(0xff0000, 0.6);
    graphics.fillRect(offsetX - 5, offsetY + 6, 4, 4);
    graphics.fillRect(offsetX + 1, offsetY + 8, 4, 4);

    // 武器装饰（发光效果）
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(offsetX - 4, offsetY - 28, 3);
    graphics.fillCircle(offsetX + 4, offsetY - 28, 3);
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(offsetX - 4, offsetY - 28, 2);
    graphics.fillCircle(offsetX + 4, offsetY - 28, 2);

    // 机体装甲线条
    graphics.lineStyle(1, color, 0.5);
    graphics.strokeRect(offsetX - 8, offsetY - 30, 16, 50);
    graphics.strokeRect(offsetX - 6, offsetY - 10, 12, 20);

    // 威胁标识（小红点）
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(offsetX - 10, offsetY + 0, 2);
    graphics.fillCircle(offsetX + 10, offsetY + 0, 2);

    graphics.generateTexture('enemy', 90, 85);
    graphics.destroy();
  }

  /**
   * 创建子弹精灵 - 增强版
   */
  static createBulletSprite(scene, key, color) {
    const graphics = scene.add.graphics();
    const offsetX = 1; // X偏移
    const offsetY = 0; // Y偏移

    // 子弹阴影
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(offsetX + 1, offsetY + 1, 7, 19);

    // 子弹外壳（深色）
    const darkColor = AssetGenerator.safeColorSub(color, 0x444400);
    graphics.fillStyle(darkColor, 1);
    graphics.fillRect(offsetX + 0, offsetY + 0, 8, 20);

    // 子弹高光层
    graphics.fillStyle(color, 1);
    graphics.fillRect(offsetX + 1, offsetY + 1, 6, 18);

    // 子弹核心（亮色）
    const brightColor = AssetGenerator.safeColorAdd(color, 0x333300);
    graphics.fillStyle(brightColor, 1);
    graphics.fillRect(offsetX + 2, offsetY + 2, 4, 16);

    // 子弹尖端（更亮）
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillRect(offsetX + 3, offsetY + 1, 2, 4);

    // 能量光晕效果（外围光圈）
    graphics.lineStyle(1, color, 0.4);
    graphics.strokeRect(offsetX - 1, offsetY + 4, 10, 12);

    graphics.generateTexture(key, 10, 22);
    graphics.destroy();
  }

  /**
   * 创建经验球精灵 - 增强版（发光宝石效果）
   */
  static createXPOrbSprite(scene) {
    const graphics = scene.add.graphics();
    const offsetX = 0; // X偏移
    const offsetY = 0; // Y偏移

    // 外层光晕（大圆）
    graphics.fillStyle(0x00ffff, 0.3);
    graphics.fillCircle(offsetX + 6, offsetY + 6, 6);

    // 中层光晕
    graphics.fillStyle(0x00ffff, 0.6);
    graphics.fillCircle(offsetX + 6, offsetY + 6, 5);

    // 主体（青色宝石）
    graphics.fillStyle(0x00dddd, 1);
    graphics.fillCircle(offsetX + 6, offsetY + 6, 4);

    // 核心（亮青色）
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(offsetX + 6, offsetY + 6, 3);

    // 高光点（白色闪光）
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(offsetX + 5, offsetY + 5, 2);
    graphics.fillCircle(offsetX + 7, offsetY + 7, 1);

    graphics.generateTexture('xp-orb', 12, 12);
    graphics.destroy();
  }

  /**
   * 创建BOSS飞船精灵 - 增强版
   */
  static createBossSprite(scene) {
    const graphics = scene.add.graphics();
    const offsetX = 65; // 中心X偏移
    const offsetY = 45; // 中心Y偏移

    // 阴影层
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRect(offsetX - 28, offsetY - 23, 56, 48);

    // 主机身 - 深紫色基底
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(offsetX - 30, offsetY - 25, 60, 50);

    // 机身高光层
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(offsetX - 28, offsetY - 23, 56, 46);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillRect(offsetX - 24, offsetY - 20, 48, 40);

    // 驾驶舱（中央凸起）- 多层结构
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(offsetX - 15, offsetY - 38, 30, 18);
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(offsetX - 13, offsetY - 36, 26, 14);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillRect(offsetX - 11, offsetY - 34, 22, 10);

    // 装甲板线条
    graphics.lineStyle(2, 0x660066, 1);
    graphics.strokeRect(offsetX - 30, offsetY - 25, 60, 50);
    graphics.strokeRect(offsetX - 15, offsetY - 38, 30, 18);
    graphics.lineStyle(0);

    // 左侧机翼/引擎 - 更强壮的设计
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(offsetX - 58, offsetY - 12, 28, 24);
    graphics.fillTriangle(offsetX - 58, offsetY - 12, offsetX - 64, offsetY + 0, offsetX - 58, offsetY + 12);
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(offsetX - 56, offsetY - 10, 24, 20);
    // 左引擎发光核心
    graphics.fillStyle(0xff0088, 1);
    graphics.fillRect(offsetX - 52, offsetY - 6, 16, 12);
    graphics.fillStyle(0xff66ff, 1);
    graphics.fillRect(offsetX - 48, offsetY - 4, 12, 8);

    // 右侧机翼/引擎
    graphics.fillStyle(0xaa00aa, 1);
    graphics.fillRect(offsetX + 30, offsetY - 12, 28, 24);
    graphics.fillTriangle(offsetX + 58, offsetY - 12, offsetX + 64, offsetY + 0, offsetX + 58, offsetY + 12);
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(offsetX + 32, offsetY - 10, 24, 20);
    // 右引擎发光核心
    graphics.fillStyle(0xff0088, 1);
    graphics.fillRect(offsetX + 36, offsetY - 6, 16, 12);
    graphics.fillStyle(0xff66ff, 1);
    graphics.fillRect(offsetX + 36, offsetY - 4, 12, 8);

    // 机头（下方尖锐攻击锋）
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillTriangle(offsetX + 0, offsetY + 44, offsetX - 24, offsetY + 25, offsetX + 24, offsetY + 25);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillTriangle(offsetX + 0, offsetY + 44, offsetX - 16, offsetY + 28, offsetX + 16, offsetY + 28);

    // 驾驶舱窗口（深紫色带能量光）
    graphics.fillStyle(0x220022, 1);
    graphics.fillRect(offsetX - 12, offsetY - 32, 24, 12);
    graphics.fillStyle(0xff00ff, 0.7);
    graphics.fillRect(offsetX - 10, offsetY - 30, 8, 4);
    graphics.fillRect(offsetX + 2, offsetY - 28, 8, 4);

    // 护盾发生器（蓝色圆形）
    graphics.fillStyle(0x00ccff, 1);
    graphics.fillCircle(offsetX - 22, offsetY - 15, 5);
    graphics.fillCircle(offsetX + 22, offsetY - 15, 5);
    graphics.fillStyle(0x88eeff, 1);
    graphics.fillCircle(offsetX - 22, offsetY - 15, 3);
    graphics.fillCircle(offsetX + 22, offsetY - 15, 3);

    // 重型武器挂点（橙红色）
    graphics.fillStyle(0xff4400, 1);
    graphics.fillCircle(offsetX - 22, offsetY + 10, 5);
    graphics.fillCircle(offsetX + 22, offsetY + 10, 5);
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(offsetX - 22, offsetY + 10, 3);
    graphics.fillCircle(offsetX + 22, offsetY + 10, 3);

    // 能量核心（中央发光）
    graphics.fillStyle(0xff00ff, 0.8);
    graphics.fillCircle(offsetX + 0, offsetY + 0, 8);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(offsetX + 0, offsetY + 0, 5);
    graphics.fillStyle(0xff44ff, 1);
    graphics.fillCircle(offsetX + 0, offsetY + 0, 3);

    // 装甲细节线条
    graphics.lineStyle(1, 0xff44ff, 0.6);
    graphics.strokeRect(offsetX - 26, offsetY - 22, 20, 40);
    graphics.strokeRect(offsetX + 6, offsetY - 22, 20, 40);

    graphics.generateTexture('boss', 130, 90);
    graphics.destroy();
  }

  /**
   * 创建粒子纹理（用于特效系统）
   */
  static createParticleSprite(scene) {
    const graphics = scene.add.graphics();
    const offsetX = 0; // X偏移
    const offsetY = 0; // Y偏移

    // 创建圆形粒子，带渐变效果
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(offsetX + 4, offsetY + 4, 4);
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(offsetX + 4, offsetY + 4, 3);
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillCircle(offsetX + 4, offsetY + 4, 2);

    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
  }

  /**
   * 生成所有临时资源
   */
  static generateAll(scene) {
    this.createPlayerSprite(scene, 0, 0, { addToScene: false });
    this.createEnemySprite(scene);
    this.createBulletSprite(scene, 'bullet', 0x00e5ff);
    this.createBulletSprite(scene, 'enemy-bullet', 0xff2ad4);
    this.createXPOrbSprite(scene);
    this.createBossSprite(scene);
    this.createParticleSprite(scene);
  }
}
