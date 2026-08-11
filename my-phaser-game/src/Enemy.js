import * as Phaser from "phaser";
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, player) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    scene.physics.add.existing(this);
    this.player = player; //<----
  }

  update() {
    this.speed = 80;
    //this.play("br_zombie_idle", true);
    this.scene.physics.moveToObject(this, this.player, this.speed);

    if (this.body.velocity.x > 0) {
      this.anims.play("br_zombie_walk", true).setFlipX(true);
    }
    if (this.body.velocity.x < 0) {
      this.anims.play("br_zombie_walk", true).setFlipX(false);
    }
  }
}
