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
  }

  update() {
    if (this.playerHealth > 0) {
      this.speed = 200;
      let direction = null;
      this.setVelocityX(0);
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
      } else if (this.inputKeys.up.isDown && this.body.touching.down) {
        this.setVelocityY(-250);
        const charAnimation = this.anims.play("w_knight_jump", true);
        ////////////////////////////////////
      } else if (this.inputKeys.down.isDown) {
        const charAnimation = this.anims.play("w_knight_shield", true);
        ////////////////////////////////////
      } else if (this.inputKeys.mele.isDown) {
        const charAnimation = this.anims.play("w_knight_slash", true);
      } else if (this.inputKeys.mele2.isDown) {
        this.setVelocity(0, 0);
        const charAnimation = this.anims.play("w_knight_stab", true);
      } else {
        const charAnimation = this.anims.play("w_knight_idle", true);
        ////////////////////////////////////
      }

      ////////////////////////////////////
    }
  }
}
