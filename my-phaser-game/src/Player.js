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
    this.hasGem = false;
  }

  update() {
    if (this.playerHealth > 0) {
      this.speed = 200;
      let direction = null;
      this.setVelocity(0);
      let idle = true;
      let attacking = false;
      //Need to add functionality to walk and slash at the same time

      if (this.inputKeys.mele.isDown) {
        this.setVelocity(0);
        const charAnimation = this.anims.play("w_knight_slash", true);
        attacking = true;
        idle = false;
      }
      if (this.inputKeys.mele2.isDown) {
        this.setVelocity(0);
        const charAnimation = this.anims.play("w_knight_stab", true);
        attacking = true;
        idle = false;
      }
      ////////////////////////////////////

      if (this.inputKeys.left.isDown) {
        this.setVelocityX(-this.speed);
        this.direction = "left";

        if (!attacking) {
          const charAnimation = this.anims.play("w_knight_walk", true);
          charAnimation.setFlipX(false);
        }
        idle = false;
        ////////////////////////////////////
      }
      if (this.inputKeys.right.isDown) {
        this.setVelocityX(this.speed);
        this.direction = "right";
        if (!attacking) {
          const charAnimation = this.anims.play("w_knight_walk", true);
          charAnimation.setFlipX(true);
        }

        idle = false;
        ////////////////////////////////////
      }
      if (this.inputKeys.up.isDown) {
        this.setVelocityY(-500);

        idle = false;
        ////////////////////////////////////
      }
      if (this.inputKeys.down.isDown) {
        this.setVelocity(0);
        const charAnimation = this.anims.play("w_knight_shield", true);
        idle = false;
        ////////////////////////////////////
      }
      if (idle) {
        const charAnimation = this.anims.play("w_knight_idle", true);
      }
      ////////////////////////////////////
    }
  }
}
