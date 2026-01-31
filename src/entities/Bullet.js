// src/entities/Bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 子弹缩小一些
    this.setScale(0.4);

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
    let bullet = this.getFirstDead(false);
    if (!bullet) {
      // 如果对象池满了，创建新子弹
      bullet = new Bullet(this.scene, x, y, this.texture.key);
      this.add(bullet);
    }
    if (bullet && bullet.fire) {
      bullet.fire(x, y, velocityY, damage);
    }
    return bullet;
  }
}
