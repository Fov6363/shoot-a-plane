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
