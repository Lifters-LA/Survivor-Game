export default class HealthBar {
  constructor(scene, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxhealth = 100;
    this.currentHealth = 100;

    this.bg = scene.add
      .rectangle(x, y, width, height, 0x555555)
      .setOrigin(0, 0);
    this.bar = scene.add
      .rectangle(x, y, width, height, 0x00ff00)
      .setOrigin(0, 0);
  }
  setHealth(amount) {
    this.currentHealth = Phaser.Math.Clamp(amount, 0, this.maxhealth);
    const scale = this.currentHealth / this.maxhealth;
    this.bar.displayWidth = this.width * scale;

    if (scale < 0.25) this.bar.setFillStyle(0xff0000);
    else if (scale < 0.5) this.bar.setFillStyle(0xffa500);
    else this.bar.setFillStyle(0x00ff00);
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.bg.setPosition(x, y);
    this.bar.setPosition(x, y);
  }
}
