import * as Phaser from "phaser";
import { Scene } from "phaser";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
export class MainScene extends Scene {
  constructor() {
    super("MainScene");
  }
  //Emitter - https://labs.phaser.io/phaser4-view.html?src=src%5Cevents%5Clisten%20to%20game%20object%20event.js&return=phaser4-index.html%3Fpath%3Devents
  //Load images
  preload() {
    this.load.image("ground", "./src/assets/testplatform.png");
    this.load.spritesheet("items", "./src/assets/items.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("player", "./src/assets/wknight.png");
    this.load.image("enemy", "./src/assets/brzombie.png");
    this.load.image("sky", "./src/assets/sky.png");
    this.load.atlas(
      "wknight",
      "./src/assets/wknight.png",
      "./src/assets/wknight_atlas.json",
    );
    this.load.atlas(
      "brzombie",
      "./src/assets/brzombie.png",
      "./src/assets/brzombie_atlas.json",
    );
    this.load.animation("wknight_anim", "./src/assets/wknight_anim.json");
    this.load.animation("brzombie_anim", "./src/assets/brzombie_anim.json");
  }

  create() {
    ///////////////////////////////CREATE TIMER
    //Need to count Zombies
    //timer = this.time.addEvent({ delay: 10000, callback: this.endOfRound, callbackScope: this }); <---Timer
    ///////////////////////////////TEST Terrain
    this.add.image(400, 300, "sky");
    const platform = this.physics.add.staticGroup();
    platform.create(400, 580, "ground").setScale(2).refreshBody();
    ///////////////////////////////TEST Flag/Jem
    this.gem = this.physics.add.sprite(100, 500, "items", 207);
    this.gem.setScale(2);
    this.gem.setCollideWorldBounds(true);
    this.physics.add.collider(this.gem, platform);
    ///////////////////////////////TEST PLAYER(START) <--These values added to player class later
    this.player = new Player(this, 600, 450, "w_knight001", this.Enemy);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 42);
    this.player.body.setOffset(14, 16);
    this.player.setBounceY(0.5);
    this.player.setScale(3);
    this.player.body.onCollide = true;
    this.physics.add.collider(this.player, platform);
    this.physics.add.collider(this.player, this.enemy);
    this.player1Gem = this.add.sprite(0, 0, "items", 207).setVisible(false);
    this.player1Gem.setScale(2);
    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      mele: Phaser.Input.Keyboard.KeyCodes.SPACE,
      mele2: Phaser.Input.Keyboard.KeyCodes.C,
    });
    //Gem Collider******************************
    this.physics.add.overlap(this.player, this.gem, null, (player, gem) => {
      this.player1Gem.setVisible(true);
      this.player.hasGem = true;
      this.enemy.patrol = false;
      console.log(this.enemy.patrol);
      this.tweens.killAll();
      this.enemy.setDirectControl(false);
      this.gem.destroy();
    });
    ///////////////////////////////TEST PLAYER(END)

    /////////////////////////////////TEST ENEMY(START) <--These values added to enemy class later
    this.enemy = new Enemy(this, 300, 450, "br_zombie000", this.player);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.body.setGravityY(500);
    this.enemy.setBounce(1, 1);
    this.enemy.setScale(3);
    this.enemy.body.onCollide = true;
    this.enemy.body.setSize(22, 42);
    this.enemy.body.setOffset(18, 22);
    this.enemy.patrol = true; //<----Controls Patrol behavior - Set to true to start patrol behavior
    //Damage Collider******************************
    this.physics.add.overlap(
      this.enemy,
      this.player,
      null,
      (player, enemy2) => {
        if (this.player.inputKeys.down.isDown && this.player.shieldHealth > 1) {
          this.player.shieldHealth = this.player.shieldHealth -= 100;
          console.log(this.player.shieldHealth);
          this.player.setTint(0x0000ff);
          this.time.delayedCall(100, () => {
            this.player.clearTint();
          });
        } else {
          this.player.playerHealth = this.player.playerHealth -= 50;
          this.player.setTint(0xff0000);
          this.time.delayedCall(100, () => {
            this.player.clearTint();
          });
          if (this.player.playerHealth < 1) {
            if (this.player.hasGem == true) {
              this.player1Gem.setVisible(false);
              this.gem = this.physics.add.sprite(
                this.player.x,
                this.player.y,
                "items",
                207,
              );
              this.gem.setScale(2);
              this.gem.setCollideWorldBounds(true);
              this.physics.add.collider(this.gem, platform);
              this.player.destroy();
            } else {
              this.player.destroy();
            }
          }
        }
      },
    );
    //Patrol Behavior******************************
    if (this.enemy.patrol == true) {
      this.enemy.setDirectControl();
      this.enemy.setImmovable();

      this.tweens.add({
        targets: this.enemy,
        x: 500,
        duration: 2000,
        ease: "sine.inout",
        repeat: -1,
        yoyo: true,
      });
    }
    /////////////////////////////////TEST ENEMY(END)
  }
  update() {
    /////////////////////////////////UPDATE PLAYER (START)
    this.player.update();
    if (this.player.playerHealth) {
      Phaser.Display.Bounds.SetCenterX(
        this.player1Gem,
        this.player.body.center.x,
      );
      Phaser.Display.Bounds.SetBottom(this.player1Gem, this.player.body.top);
    }
    /////////////////////////////////UPDATE PLAYER (END)

    this.enemy.update();
  }
}
