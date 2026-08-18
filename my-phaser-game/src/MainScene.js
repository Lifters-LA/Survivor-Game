import * as Phaser from "phaser";
import { Scene } from "phaser";
import { Player } from "./Player";
import { Enemy } from "./Enemy";

export class MainScene extends Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    // ============================
    // MAP
    // ============================

    this.load.tilemapTiledJSON("map", "/maps/map.json");

    // ============================
    // TILESET IMAGES
    // ============================

    this.load.image("dungeonTiles", "/maps/Dungeon Tile Set (1).png");

    this.load.image("saltTiles", "/maps/Salt.png");

    this.load.image("backgroundTiles", "/maps/Background_0.png");

    this.load.image("grassBackgroundTiles", "/maps/Grass_background_2.png");

    // ============================
    // PLAYER / ENEMY
    // ============================

    this.load.image("player", "./src/assets/wknight.png");
    this.load.image("enemy", "./src/assets/brzombie.png");

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
    // ============================
    // CREATE MAP
    // ============================

    const map = this.make.tilemap({
      key: "map",
    });

    // ============================
    // CONNECT TILESETS
    // ============================

    const dungeonTiles = map.addTilesetImage(
      "Dungeon Tile Set (1)",
      "dungeonTiles",
    );

    const saltTiles = map.addTilesetImage("Salt", "saltTiles");

    const backgroundTiles = map.addTilesetImage(
      "Background_0",
      "backgroundTiles",
    );

    const grassBackgroundTiles = map.addTilesetImage(
      "Grass_background_2",
      "grassBackgroundTiles",
    );

    // Put all tilesets into one array
    const allTilesets = [
      dungeonTiles,
      saltTiles,
      backgroundTiles,
      grassBackgroundTiles,
    ];

    // ============================
    // CREATE MAP LAYERS
    // ============================

    const backgroundLayer = map.createLayer("background", allTilesets);

    const tileLayer1 = map.createLayer("Tile Layer 1", allTilesets);

    const tileLayer2 = map.createLayer("Tile Layer 2", allTilesets);

    // ============================
    // COLLISION
    // ============================

    tileLayer1.setCollisionByExclusion([-1]);
    tileLayer2.setCollisionByExclusion([-1]);

    // You probably do NOT want background colliding.
    // backgroundLayer.setCollisionByExclusion([-1]);

    // ============================
    // WORLD BOUNDS
    // ============================

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // ============================
    // TEST TERRAIN
    // ============================

    const platform = this.physics.add.staticGroup();

    // ============================
    // PLAYER
    // ============================

    this.player = new Player(this, 300, 450, "w_knight001", this.Enemy);

    this.player.setCollideWorldBounds(true);

    this.player.body.setGravityY(9000);

    this.player.setBounce(0.2);

    this.player.setScale(3);

    this.player.body.onCollide = true;

    this.physics.add.collider(this.player, platform);

    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      mele: Phaser.Input.Keyboard.KeyCodes.SPACE,
      mele2: Phaser.Input.Keyboard.KeyCodes.C,
    });

    // ============================
    // ENEMY 1
    // ============================

    this.enemy = new Enemy(this, 500, 450, "br_zombie000", this.player);

    this.enemy.setCollideWorldBounds(true);

    this.enemy.body.setGravityY(500);

    this.enemy.setBounce(0.2);

    this.enemy.setScale(3);

    // ============================
    // PLAYER / ENEMY DAMAGE
    // ============================

    this.physics.add.collider(
      this.enemy,
      this.player,
      null,
      (player, enemy2) => {
        this.player.playerHealth -= 50;

        this.player.setTint(0xff0000);

        this.time.delayedCall(100, () => {
          this.player.clearTint();
        });

        console.log(this.player.playerHealth);

        if (this.player.playerHealth < 1) {
          console.log("DEAD!!!");

          this.player.destroy();
        }
      },
    );

    // ============================
    // PLAYER MAP COLLISION
    // ============================

    this.physics.add.collider(this.player, tileLayer1);

    this.physics.add.collider(this.player, tileLayer2);

    // ============================
    // ENEMY 1 MAP COLLISION
    // ============================

    this.physics.add.collider(this.enemy, tileLayer1);

    this.physics.add.collider(this.enemy, tileLayer2);

    // ============================
    // ENEMY 2
    // ============================

    this.enemy2 = new Enemy(this, 200, 450, "br_zombie000", this.player);

    this.enemy2.setCollideWorldBounds(true);

    this.enemy2.body.setGravityY(500);

    this.enemy2.setBounce(0.2);

    this.enemy2.setScale(3);

    this.physics.add.collider(this.enemy2, this.player);

    this.physics.add.collider(this.enemy2, tileLayer1);

    this.physics.add.collider(this.enemy2, tileLayer2);

    // ============================
    // CAMERA
    // ============================

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameras.main.startFollow(this.player);
  }

  update() {
    if (this.player?.active) {
      this.player.update();
    }

    if (this.enemy?.active) {
      this.enemy.update();
    }

    if (this.enemy2?.active) {
      this.enemy2.update();
    }
  }
}
