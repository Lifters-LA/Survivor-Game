import * as Phaser from "phaser";
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, player) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.player = player; //<----
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.patrol = true;
    this.hitBySword = () => {
      this.health -= 1;

      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => {
        this.clearTint();
      });

      console.log(this.health);
    };
  }

  update() {
    if (this.health > 0) {
      ///////////////////////////////ZOMBIE MOVEMENT/HEALTH DATA
      //Set speed and calculate range between the zombie and it's prey! <---Adjust this for the map!!!
      this.speed = 200;
      this.maximumHeight = 350;
      this.minimumHeight = 450;
      let aRange = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.x,
        this.y,
      );
      ///////////////////////////////ZOMBIE APPROACHES PLAYER
      if (aRange > 105 && this.patrol == false) {
        this.scene.physics.moveToObject(this, this.player, this.speed);

        if (this.body.velocity.x > 0) {
          this.anims.play("br_zombie_walk", true).setFlipX(true);
        }
        if (this.body.velocity.x < 0) {
          this.anims.play("br_zombie_walk", true).setFlipX(false);
        }
      }

      //This keeps the the ground based enemy from following the player vertically
      //Remove when using an actual map
      if (this.y >= this.maximumHeight) {
        this.setVelocityY(0);
        this.y = this.minimumHeight;
      }
      ///////////////////////////////TEST ATTACK

      if (aRange < 115) {
        this.anims.play("br_zombie_attack", true);
      }

      if (
        aRange < 150 &&
        (Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele) ||
          Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele2))
      ) {
        if (
          (this.player.direction == "left" && this.x < this.player.x) ||
          (this.player.direction == "right" && this.x > this.player.x)
        ) {
          console.log("HIT!!!");
          this.hitBySword();
        }
      }
    } else if (this.health < 1) {
      this.destroy();
    }

    ///////////////////////////////TEST PATROL

    if (this.patrol == true) {
      //Animation************************************
      console.log(this.body.velocity.x);
      if (this.body.velocity.x > 0) {
        const patrolAnimation = this.anims
          .play("br_zombie_walk", true)
          .setFlipX(true);
      }
      if (this.body.velocity.x < 0) {
        const patrolAnimation = this.anims
          .play("br_zombie_walk", true)
          .setFlipX(false);
      }
    }
    ///////////////////////////////
  }
}
