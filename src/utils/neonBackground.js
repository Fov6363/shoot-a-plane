// src/utils/neonBackground.js

export class NeonBackground {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.cameras.main;

    this.width = width;
    this.height = height;

    this.createGradientLayer();
    this.createStarLayer();
    this.createStreakLayer();
    this.createScanlineLayer();
  }

  createGradientLayer() {
    const key = 'bg-gradient';
    if (!this.scene.textures.exists(key)) {
      const canvas = this.scene.textures.createCanvas(key, this.width, this.height);
      const ctx = canvas.getContext();

      const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, '#060815');
      gradient.addColorStop(0.5, '#0a0f2a');
      gradient.addColorStop(1, '#120a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);

      canvas.refresh();
    }

    this.gradient = this.scene.add.image(0, 0, key).setOrigin(0, 0);
    this.gradient.setDepth(-20);
  }

  createStarLayer() {
    const key = 'bg-stars';
    if (!this.scene.textures.exists(key)) {
      const canvas = this.scene.textures.createCanvas(key, this.width, this.height);
      const ctx = canvas.getContext();

      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, this.width, this.height);

      for (let i = 0; i < 220; i++) {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        const radius = Math.random() * 1.2 + 0.2;
        const alpha = Math.random() * 0.8 + 0.2;
        ctx.fillStyle = `rgba(120,180,255,${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.refresh();
    }

    this.stars = this.scene.add.tileSprite(0, 0, this.width, this.height, key).setOrigin(0, 0);
    this.stars.setAlpha(0.6);
    this.stars.setDepth(-19);
  }

  createStreakLayer() {
    const key = 'bg-streaks';
    if (!this.scene.textures.exists(key)) {
      const canvas = this.scene.textures.createCanvas(key, 64, 128);
      const ctx = canvas.getContext();

      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 64, 128);

      for (let i = 0; i < 10; i++) {
        const x = Math.random() * 64;
        const height = Math.random() * 60 + 30;
        const alpha = Math.random() * 0.4 + 0.1;
        ctx.fillStyle = `rgba(0, 220, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(x, Math.random() * 128, 1, height);
      }

      canvas.refresh();
    }

    this.streaks = this.scene.add.tileSprite(0, 0, this.width, this.height, key).setOrigin(0, 0);
    this.streaks.setAlpha(0.35);
    this.streaks.setDepth(-18);
  }

  createScanlineLayer() {
    const key = 'bg-scanlines';
    if (!this.scene.textures.exists(key)) {
      const canvas = this.scene.textures.createCanvas(key, 2, 4);
      const ctx = canvas.getContext();
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 2, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, 2, 1);
      canvas.refresh();
    }

    this.scanlines = this.scene.add.tileSprite(0, 0, this.width, this.height, key).setOrigin(0, 0);
    this.scanlines.setAlpha(0.35);
    this.scanlines.setDepth(50);
  }

  update(delta) {
    this.stars.tilePositionY -= delta * 0.01;
    this.streaks.tilePositionY += delta * 0.12;
    this.scanlines.tilePositionY += delta * 0.02;
  }
}
