// src/systems/BossManager.js

import { GAME_CONFIG } from '../config/gameConfig.ts';
import { Boss } from '../entities/Boss.js';

export class BossManager {
  constructor(scene, bossGroup) {
    this.scene = scene;
    this.bossGroup = bossGroup;

    this.currentBoss = null;
    this.stage = 0;
    this.stageTimer = 0;
    this.inBossPhase = false;

    // 监听BOSS击杀
    scene.events.on('boss-killed', this.onBossKilled, this);
  }

  /**
   * 更新
   */
  update(time, delta) {
    if (this.inBossPhase) {
      return; // BOSS战期间不计时
    }

    this.stageTimer += delta;

    // 检查是否该生成BOSS
    if (this.stageTimer >= GAME_CONFIG.BOSS.STAGE_DURATION) {
      this.spawnBoss();
    }
  }

  /**
   * 生成BOSS
   */
  spawnBoss() {
    if (this.currentBoss) {
      return; // 已有BOSS存在
    }

    this.stage++;
    this.inBossPhase = true;
    this.stageTimer = 0;

    // 不再清除小怪，BOSS期间也保留小兵
    // this.scene.events.emit('clear-all-enemies');

    // 显示BOSS警告
    this.showBossWarning();

    // 2秒后生成BOSS
    this.scene.time.delayedCall(2000, () => {
      const { width } = this.scene.cameras.main;
      this.currentBoss = new Boss(this.scene, width / 2, -50, this.stage);

      // 将BOSS添加到组中
      if (this.bossGroup) {
        this.bossGroup.add(this.currentBoss);
      }

      // 触发BOSS出现事件
      this.scene.events.emit('boss-spawned', {
        boss: this.currentBoss,
        stage: this.stage
      });
    });
  }

  /**
   * 显示BOSS警告
   */
  showBossWarning() {
    const { width, height } = this.scene.cameras.main;

    const warningText = this.scene.add.text(width / 2, height / 2, 'BOSS WARNING!', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 闪烁效果
    this.scene.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        warningText.destroy();
      }
    });

    // 播放警告音（如果有）
    // this.scene.sound.play('boss-warning');
  }

  /**
   * BOSS被击杀
   */
  onBossKilled(data) {
    this.currentBoss = null;
    this.inBossPhase = false;

    // 增加阶段
    this.scene.events.emit('stage-increase', this.stage);

    // 显示阶段完成
    this.showStageComplete();

    // 延迟 2.5 秒后打开商店
    this.scene.time.delayedCall(2500, () => {
      this.scene.events.emit('open-shop');
    });
  }

  /**
   * 显示阶段完成
   */
  showStageComplete() {
    const { width, height } = this.scene.cameras.main;

    const text = this.scene.add.text(width / 2, height / 2, `阶段 ${this.stage} 完成!`, {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: height / 2 - 50,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * 获取当前BOSS
   */
  getCurrentBoss() {
    return this.currentBoss;
  }

  /**
   * 是否在BOSS战阶段
   */
  isInBossPhase() {
    return this.inBossPhase;
  }

  /**
   * 获取距离下一个BOSS的剩余时间（秒）
   */
  getTimeToNextBoss() {
    if (this.inBossPhase) return 0;
    const remaining = GAME_CONFIG.BOSS.STAGE_DURATION - this.stageTimer;
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * 获取当前阶段
   */
  getStage() {
    return this.stage;
  }

  /**
   * 销毁
   */
  destroy() {
    this.scene.events.off('boss-killed', this.onBossKilled, this);
    if (this.currentBoss) {
      this.currentBoss.destroy();
    }
  }
}
