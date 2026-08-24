import * as Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHealth = 3;
    this.health = this.maxHealth;

    this.id = null;
  }

  // =====================================
  // UPDATE FROM SERVER
  // =====================================

  updateFromServer(enemyData) {
    this.health = enemyData.health;

    this.setPosition(enemyData.x, enemyData.y);

    // =============================
    // ANIMATIONS
    // =============================

    if (enemyData.animation === "walk") {
      this.anims.play("br_zombie_walk", true);
    } else if (enemyData.animation === "attack") {
      this.anims.play("br_zombie_attack", true);
    } else if (enemyData.animation === "idle") {
      this.anims.stop();
    }

    // =============================
    // DIRECTION
    // =============================

    if (enemyData.flipX !== undefined) {
      this.setFlipX(enemyData.flipX);
    }

    // =============================
    // DEATH
    // =============================

    if (this.health <= 0) {
      this.setVisible(false);

      if (this.body) {
        this.body.enable = false;
      }
    } else {
      this.setVisible(true);

      if (this.body) {
        this.body.enable = true;
      }
    }
  }

  // =====================================
  // VISUAL HIT EFFECT
  // =====================================

  showHit() {
    this.setTint(0xff0000);

    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.clearTint();
      }
    });
  }
}
