import * as Phaser from "phaser";
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(this.width, this.height, true);
    this.enemy = this.enemy;
    this.maximumHealth = 5000;
    this.playerHealth = this.maximumHealth;
    this.maxShieldHealth = 2000;
    this.shieldHealth = this.maximumHealth;
    this.direction = null;
  }

  update() {
    if (this.playerHealth > 0) {
      this.speed = 200;
      this.setVelocityX(0);
      if (this.inputKeys.left.isDown) {
        this.setVelocityX(-this.speed);
        this.direction = "left";
        const charAnimation = this.anims.play("w_knight_walk", true);
        charAnimation.setFlipX(false);
        ////////////////////////////////////
      } else if (this.inputKeys.right.isDown) {
        this.setVelocityX(this.speed);
        this.direction = "right";
        const charAnimation = this.anims.play("w_knight_walk", true);
        charAnimation.setFlipX(true);
        ////////////////////////////////////
      } else if (this.inputKeys.up.isDown && this.body.touching.down) {
        this.setVelocityY(-275);
        const charAnimation = this.anims.play("w_knight_jump", true);
        ////////////////////////////////////
      } else if (this.inputKeys.down.isDown) {
        const charAnimation = this.anims.play("w_knight_shield", true);
        this.direction = "down";
        ////////////////////////////////////
      } else if (this.inputKeys.mele.isDown) {
        console.log(this.direction);
        const charAnimation = this.anims.play("w_knight_slash", true);
      } else if (this.inputKeys.mele2.isDown) {
        const charAnimation = this.anims.play("w_knight_stab", true);
      } else {
        const charAnimation = this.anims.play("w_knight_idle", true);
        ////////////////////////////////////
      }

      ////////////////////////////////////
    }
  }
}
