// src/systems/InputManager.js

export class InputManager {
  constructor(scene) {
    this.scene = scene;

    // 触屏检测
    this.isTouchDevice = this.detectTouchDevice();

    // 输入状态
    this.inputState = {
      x: 0,
      y: 0,
      shoot: false
    };

    if (this.isTouchDevice) {
      // 触屏模式：手指按住跟随 + 自动射击
      this.pointer = scene.input.activePointer;
      this.touching = false;
      this._skillButtons = []; // GameScene 会设置

      scene.input.on('pointerdown', (pointer) => {
        // 检查是否点到了技能按钮区域
        if (this._isOnSkillButton(pointer)) return;
        this.touching = true;
      });

      scene.input.on('pointerup', () => {
        this.touching = false;
      });
    } else {
      // PC 模式：键盘 + 鼠标
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
      });

      this.pointer = scene.input.activePointer;
      this.mouseMode = false;

      scene.input.on('pointermove', () => {
        this.mouseMode = true;
      });

      scene.input.keyboard.on('keydown', () => {
        this.mouseMode = false;
      });
    }
  }

  /**
   * 检测是否为触屏设备
   */
  detectTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 检查触摸是否在技能按钮上或升级UI区域
   */
  _isOnSkillButton(pointer) {
    // 升级 UI 激活时，底部 22% 区域不触发移动
    if (this.scene.upgradeUIActive) {
      const { height } = this.scene.cameras.main;
      if (pointer.y > height * 0.78) return true;
    }

    for (const btn of this._skillButtons) {
      if (!btn || !btn.circle.visible) continue;
      const dist = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        btn.circle.x, btn.circle.y
      );
      if (dist <= btn.circle.radius) return true;
    }
    return false;
  }

  /**
   * 更新输入状态
   */
  update() {
    if (this.isTouchDevice) {
      this.updateTouchInput();
    } else if (this.mouseMode) {
      this.updateMouseInput();
    } else {
      this.updateKeyboardInput();
    }

    return this.inputState;
  }

  /**
   * 更新触屏输入
   */
  updateTouchInput() {
    // 触屏始终自动射击
    this.inputState.shoot = true;

    if (!this.touching || !this.pointer.isDown) {
      this.inputState.x = 0;
      this.inputState.y = 0;
      return;
    }

    const player = this.scene.player;
    if (!player) {
      this.inputState.x = 0;
      this.inputState.y = 0;
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      this.pointer.worldX, this.pointer.worldY
    );

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
