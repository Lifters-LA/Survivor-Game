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
    ///////////////////////////////TEST Terrain
    this.add.image(400, 300, "sky");
    const platform = this.physics.add.staticGroup();
    platform.create(400, 500, "ground").setScale(2).refreshBody();
    ///////////////////////////////TEST Terrain

    ///////////////////////////////TEST PLAYER <--These values added to player class later
    this.player = new Player(this, 300, 450, "w_knight001", this.Enemy);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(9000);
    this.player.setBounce(0.2);
    this.player.setScale(3);
    this.player.body.onCollide = true;
    this.physics.add.collider(this.player, platform);
    ///////////////////////////////TEST PLAYER
    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      mele: Phaser.Input.Keyboard.KeyCodes.SPACE,
      mele2: Phaser.Input.Keyboard.KeyCodes.C,
    });

    /////////////////////////////////TEST ENEMY <--These values added to enemy class later
    this.enemy = new Enemy(this, 500, 450, "br_zombie000", this.player);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.body.setGravityY(500);
    this.enemy.setBounce(0.2);
    this.enemy.setScale(3);
    this.physics.add.collider(this.enemy, platform);
    //this.physics.add.collider(this.enemy, this.player);
    this.physics.add.collider(
      this.enemy,
      this.player,
      null,
      (player, enemy2) => {
        this.player.playerHealth = this.player.playerHealth -= 50;
        console.log(this.player.playerHealth);
        if (this.player.playerHealth < 1) {
          this.player.destroy();
        }
      },
    );

    this.enemy2 = new Enemy(this, 200, 450, "br_zombie000", this.player);
    this.enemy2.setCollideWorldBounds(true);
    this.enemy2.body.setGravityY(500);
    this.enemy2.setBounce(0.2);
    this.enemy2.setScale(3);
    this.physics.add.collider(this.enemy2, platform);
    this.physics.add.collider(this.enemy2, this.player);

    //this.enemy3 = new Enemy(this, 550, 450, "br_zombie000", this.player);
    //this.enemy3.setCollideWorldBounds(true);
    // this.enemy3.body.setGravityY(500);
    // this.enemy3.setBounce(0.2);
    // this.enemy3.setScale(3);
    // this.physics.add.collider(this.enemy3, platform);
    // this.physics.add.collider(this.enemy3, this.player);

    /////////////////////////////////Colliders
    /* 
    this.physics.add.collider(
      this.enemy,
      this.enemy2,
      null,
      (player, enemy2) => {
        console.log(this.player.maximumHealth);
      },
    );
    */
    //this.physics.add.collider(this.enemy3, this.player);
    /////////////////////////////////TEST ENEMY GROUP
  }
  update() {
    this.player.update();
    this.enemy.update();
    this.enemy2.update();

    //this.enemy3.update();
  }
}
