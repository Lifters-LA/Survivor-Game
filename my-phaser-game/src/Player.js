import * as Phaser from "phaser";
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  ////////////////////////////////////
  ////////////////////////////////////

  ////////////////////////////////////
  ////////////////////////////////////

  update() {
    this.speed = 200;
    let direction = null;
    this.maximumHealth = 10;
    this.health = this.maximumHealth;
    //Need to add functionality to walk and slash at the same time
    if (this.inputKeys.left.isDown) {
      this.setVelocityX(-this.speed);
      direction = "left";
      const charAnimation = this.anims.play("w_knight_walk", true);
      charAnimation.setFlipX(false);
      ////////////////////////////////////
    } else if (this.inputKeys.right.isDown) {
      this.setVelocityX(this.speed);
      direction = "right";
      const charAnimation = this.anims.play("w_knight_walk", true);
      charAnimation.setFlipX(true);
      ////////////////////////////////////
    } else if (this.inputKeys.up.isDown) {
      this.setVelocityY(-500);
      const charAnimation = this.anims.play("w_knight_jump", true);
      ////////////////////////////////////
    } else if (this.inputKeys.down.isDown) {
      this.setVelocity(0);
      const charAnimation = this.anims.play("w_knight_shield", true);
      ////////////////////////////////////
    } else if (this.inputKeys.mele.isDown) {
      this.setVelocity(0);
      const charAnimation = this.anims.play("w_knight_slash", true);
    } else if (this.inputKeys.mele2.isDown) {
      this.setVelocity(0);
      const charAnimation = this.anims.play("w_knight_stab", true);
    } else {
      this.setVelocity(0);
      const charAnimation = this.anims.play("w_knight_idle", true);
      ////////////////////////////////////
    }
    ////////////////////////////////////
  }
}
