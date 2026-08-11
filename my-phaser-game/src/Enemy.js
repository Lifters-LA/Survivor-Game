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
    ///////////////////////////////ZOMBIE MOVEMENT DATA
    //Set speed and calculate range between the zombie and it's prey!
    this.speed = 20;
    let aRange = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.x,
      this.y,
    );
    console.log(aRange);
    ///////////////////////////////ZOMBIE APPROACHES PLAYER

    if (aRange > 105) {
      this.scene.physics.moveToObject(this, this.player, this.speed);

      if (this.body.velocity.x > 0) {
        this.anims.play("br_zombie_walk", true).setFlipX(true);
      }
      if (this.body.velocity.x < 0) {
        this.anims.play("br_zombie_walk", true).setFlipX(false);
      }
    }
    ///////////////////////////////TEST ATTACK

    //console.log(aRange);
    if (aRange < 110) {
      this.setVelocityY(0);
      this.anims.play("br_zombie_attack", true);
      // this.anims.play("br_zombie_attack", false);
    }
    ///////////////////////////////

    //I am attempting to limit zombie jump height
    const maximumHeight = 400;
    const minimumHeight = 550;
    if (this.y < maximumHeight) {
      this.y = maximumHeight;
      if (this.body.velocity.y < 0) this.setVelocityY(0);
      this.setVelocityY(0);
    }
  }
}
