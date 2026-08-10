import HealthBar from "../Healthbar.js";
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    console.log("game scene is created");
  }

  init() {
    this.playerHealth = 100;
    this.isGameOver = false;
    this.isInvincible = false;
    this.enemies = [];
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.spritesheet(
      "player",
      "assets/BlueKnightidleSprite-sheet16x16-ezgif.com-sprite-cutter.png",
      { frameWidth: 16, frameHeight: 16 },
    );
  }

  create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    this.playerHealthBar = new HealthBar(this, 20, 45, 200, 20);
    this.playerHealthBar.setHealth(this.playerHealth);
    this.player = this.physics.add.sprite(180, 200, "player", 3);

    this.cursors = this.input.keyboard.createCursorKeys();
    console.log("left key");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
  }
  update() {
    if (this.cursor.A.isDown) {
      this.player.body.setVelocityX(-100);
    }

    if (this.cursor.D.isDown) {
      this.player.body.setVelocityX(100);
    }

    if (this.cursor.S.isDown) {
      this.player.body.setVelocityY(-100);
    }

    if (this.cursor.W.isDown) {
      this.player.body.setVelocityY(100);
    }

    if (this.isGameOver) return;

    if (!this.isInvincible && this.player && this.enemies.length > 0) {
      this.enemies.forEach((enemy) => {
        const playerRect = this.player.getBounds();
        const enemyRect = enemy.getBounds();

        if (
          Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)
        ) {
          this.damagePlayer(10);
          return;
        }
      });
    }
  }
  handleGameOver(playerDied) {
    this.isGameOver = true;
    console.log("handleGameOver called with playerDied:", playerDied);
    if (playerDied) {
      this.cameras.main.shake(500);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.SHAKE_COMPLETE,
        () => {
          this.cameras.main.fadeOut(500);
        },
      );
    }
  }
  damagePlayer(amount) {
    this.playerHealth -= amount;
    this.playerHealthBar.setHealth(this.playerHealth);

    this.isInvincible = true;
    this.time.delayedCall(1000, () => {
      this.isInvincible = false;
    });

    if (this.playerHealth <= 0) {
      console.log("Game Over!");
      this.handleGameOver(true);
    }
  }
}
