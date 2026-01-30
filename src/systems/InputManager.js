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
