import * as Phaser from "phaser";
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, player) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.player = player; //<----
    this.maxHealth = 3;
    this.health = this.maxHealth;
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
      this.speed = 20;
      this.maximumHeight = 350;
      this.minimumHeight = 450;
      let aRange = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.x,
        this.y,
      );
      //console.log(aRange);
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

      //This keeps the the ground based enemy from following the player vertically
      if (this.y >= this.maximumHeight) {
        this.setVelocityY(0);
        this.y = this.minimumHeight;
      }
      ///////////////////////////////TEST ATTACK

      //console.log(aRange);
      if (aRange < 115) {
        //this.setVelocityX(0);
        this.anims.play("br_zombie_attack", true);
        // this.anims.play("br_zombie_attack", false);
      }

      if (
        aRange < 150 &&
        (Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele) ||
          Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele2))
      ) {
        console.log("HIT!!!");
        this.hitBySword();
      }
    } else if (this.health < 1) {
      this.destroy();
    }

    ///////////////////////////////
  }
}
