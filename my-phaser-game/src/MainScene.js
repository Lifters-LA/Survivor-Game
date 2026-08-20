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
    // PLAYER
    // ============================

    this.player = new Player(this, 300, 450, "w_knight001", this.Enemy);

    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 42);
    this.player.body.setOffset(14, 16);
    this.player.setBounceY(0.5);
    this.player.setScale(3);

    this.player.body.onCollide = true;

    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      mele: Phaser.Input.Keyboard.KeyCodes.SPACE,
      mele2: Phaser.Input.Keyboard.KeyCodes.C,
    });

    ///////////////////////////////TEST PLAYER(END)

    /////////////////////////////////TEST ENEMY(START) <--These values added to enemy class later
    this.enemy = new Enemy(this, 500, 450, "br_zombie000", this.player);
    this.physics.add.collider(this.player, this.enemy);

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
          console.log(this.player.playerHealth); ///
          this.player.setTint(0xff0000);
          this.time.delayedCall(100, () => {
            this.player.clearTint();
          });
          if (this.player.playerHealth < 1) {
            this.player.destroy();
          }
        }
      },
    );
    //Patrol Behavior******************************
    if (this.enemy.health > 0) {
      if (this.enemy.patrol == true) {
        this.enemy.setDirectControl();
        this.enemy.setImmovable();
      }
    }

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

  //
  update() {
    this.player.update();
    this.enemy.update();
  }
}
