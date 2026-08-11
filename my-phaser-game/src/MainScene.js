import * as Phaser from "phaser";
import { Scene } from "phaser";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
export class MainScene extends Scene {
  constructor() {
    super("MainScene");
  }
  //Load images
  preload() {
    this.load.image("player", "./src/assets/wknight.png");
    this.load.image("enemy", "./src/assets/brzombie.png");
    this.load.image("sky", "./src/assets/sky.png");
    this.load.image("ground", "./src/assets/testplatform.png");
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
    let platform = this.physics.add.staticGroup();
    platform.create(400, 500, "ground").setScale(2).refreshBody();
    platform.create(700, 350, "ground");
    ///////////////////////////////TEST Terrain

    ///////////////////////////////TEST PLAYER
    this.player = new Player(this, 300, 450, "w_knight001");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.body.setGravityY(2000);
    this.player.setScale(3);
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

    /////////////////////////////////TEST ENEMY
    this.enemy = new Enemy(this, 500, 450, "br_zombie000", this.player);
    this.enemy.setScale(3);
    this.enemy.setBounce(1);
    this.physics.add.collider(this.enemy, platform);
    //this.physics.add.collider(this.enemy, this.player);
    /////////////////////////////////
  }
  update() {
    this.player.update();
    this.enemy.update();
  }
}
