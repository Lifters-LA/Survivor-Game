import Phaser from "phaser";
import { Player } from "./Player";
import HealthBar from "./Healthbar.js";

export class PvPScene extends Phaser.Scene {
  constructor() {
    super("PvPScene");
    console.log("pvp scene");
  }
  init(data) {
    this.roomCode = data.roomCode;
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
    //////////////////////////////////////////////////////////
    this.load.spritesheet("items", "./src/assets/items.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
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
    const socket = this.game.socket;
    console.log("CREATE IS RUNNING");
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

    this.healthbar = new HealthBar(this, 50, 50, 120, 10);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(0.6);
    this.gem = this.physics.add.sprite(1593, 300, "items", 207);
    this.gem.setScale(2);
    this.gem.setCollideWorldBounds(true);
    this.gem.setDepth(900);

    this.physics.add.collider(this.gem, tileLayer1);
    this.physics.add.collider(this.gem, tileLayer2);
    // visual gem above local player's head
    this.playerGem = this.add
      .sprite(0, 0, "items", 207)
      .setScale(2)
      .setVisible(false)
      .setDepth(2000);

    // visual gem above enemy's head
    this.enemyGem = this.add
      .sprite(0, 0, "items", 207)
      .setScale(2)
      .setVisible(false)
      .setDepth(2000);
    ///////////////////////
    socket.on("current players", (players) => {
      console.log("players:", players);
      console.log("socket.id:", socket.id);

      Object.values(players).forEach((player) => {
        console.log("checking player:", player.id);

        if (player.id === socket.id) {
          console.log("MATCHED PLAYER");

          this.player = new Player(this, player.x, player.y, "wknight");
          this.player.hasGem = false;

          console.log("created at:", this.player.x, this.player.y);

          this.player.id = player.id;
          this.player.setScale(3);
          this.player.setCollideWorldBounds(true);
          this.player.body.setGravityY(9000);
          this.player.setBounce(0.2);
          this.player.setDepth(1000);
          this.player.body.setSize(30, 45);
          this.player.body.setOffset(20, 14);
          this.physics.add.collider(this.player, tileLayer1);
          this.physics.add.collider(this.player, tileLayer2);

          this.cameras.main.startFollow(this.player);

          this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            mele: Phaser.Input.Keyboard.KeyCodes.SPACE,
            mele2: Phaser.Input.Keyboard.KeyCodes.C,
          });
          this.physics.add.overlap(this.player, this.gem, () => {
            if (!this.gem || !this.gem.active) return;

            socket.emit("gem picked up", {
              roomCode: this.roomCode,
            });
          });
        } else {
          console.log("CREATING ENEMY FROM CURRENT PLAYERS");

          this.enemy = new Player(this, player.x, player.y, "wknight");
          this.enemy.hasGem = false;
          this.enemy.id = player.id;
          this.enemy.setScale(3);
          this.enemy.setCollideWorldBounds(true);
          this.enemy.body.setGravityY(9000);
          this.enemy.setBounce(0.2);
          this.enemy.body.onCollide = true;
          this.enemy.body.setSize(30, 45);
          this.enemy.body.setOffset(20, 14);

          this.physics.add.collider(this.enemy, tileLayer1);
          this.physics.add.collider(this.enemy, tileLayer2);
        }
      });
    });
    socket.emit("getCurrentPlayers", this.roomCode);

    socket.on("new player", (player) => {
      console.log("new player recieved", player);

      this.enemy = new Player(this, player.x, player.y, "wknight");

      this.enemy.id = player.id;
      this.enemy.setScale(3);
      this.enemy.setCollideWorldBounds(true);
      this.enemy.body.setGravityY(9000);
      this.enemy.setBounce(0.2);
      this.enemy.body.onCollide = true;
      this.physics.add.collider(this.enemy, tileLayer1);
      this.physics.add.collider(this.enemy, tileLayer2);
      this.physics.add.collider(this.enemy, this.player);
    });

    //listen for movement
    socket.on("player movement", (player) => {
      if (this.enemy) {
        this.enemy.setPosition(player.x, player.y);
        this.enemy.setVelocity(player.velocityX, player.velocityY);
        this.enemy.setFlipX(player.flipX);
        if (player.animation) {
          this.enemy.anims.play(player.animation, true);
        }
      }
    });
    ////////////////////
    socket.on("gem picked up", (player) => {
      if (this.gem) {
        this.gem.destroy();
        this.gem = null;
      }

      if (player.id === socket.id) {
        this.player.hasGem = true;
        this.playerGem.setVisible(true);

        if (this.enemy) {
          this.enemy.hasGem = false;
          this.enemyGem.setVisible(false);
        }
      } else if (this.enemy && player.id === this.enemy.id) {
        this.enemy.hasGem = true;
        this.enemyGem.setVisible(true);

        this.player.hasGem = false;
        this.playerGem.setVisible(false);
      }
    });
    //listen for health and damage
    socket.on("player health and damage", (player) => {
      if (player.id === socket.id) {
        this.healthbar.setHealth(player.health);

        if (player.health <= 0) {
          if (this.player.hasGem) {
            socket.emit("gem dropped", {
              roomCode: this.roomCode,
              x: this.player.x,
              y: this.player.y,
            });

            this.player.hasGem = false;
            this.playerGem.setVisible(false);
          }
          this.player.setVisible(false);
          this.player.body.enable = false;

          this.time.delayedCall(3000, () => {
            this.player.setPosition(300, 350);
            this.player.setVisible(true);
            this.player.body.enable = true;

            socket.emit("player respawn");
          });
        }
      }
    });

    socket.on("player damaged", (player) => {
      if (player.id === socket.id) {
        this.player.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          this.player.clearTint();
        });
      } else if (this.enemy && player.id === this.enemy.id) {
        this.enemy.setTint(0xff0000);

        this.time.delayedCall(100, () => {
          this.enemy.clearTint();
        });
      }
    });
    socket.on("gem dropped", ({ x, y }) => {
      this.player.hasGem = false;
      this.playerGem.setVisible(false);

      if (this.enemy) {
        this.enemy.hasGem = false;
        this.enemyGem.setVisible(false);
      }

      if (this.gem) {
        this.gem.destroy();
      }

      this.gem = this.physics.add.sprite(x, y, "items", 207);

      this.gem.setScale(2);
      this.gem.setCollideWorldBounds(true);
      this.gem.setDepth(900);

      this.physics.add.collider(this.gem, tileLayer1);
      this.physics.add.collider(this.gem, tileLayer2);
      this.physics.add.overlap(this.player, this.gem, () => {
        if (!this.gem || !this.gem.active) return;

        socket.emit("gem picked up", {
          roomCode: this.roomCode,
        });
      });
    });

    socket.on("player died", (player) => {
      if (this.enemy && player.id !== socket.id) {
        this.enemy.setVisible(false);
        this.enemy.body.enable = false;
      }
    });

    socket.on("player respawned", (player) => {
      if (this.enemy && player.id !== socket.id) {
        this.enemy.setPosition(player.x, player.y);
        this.enemy.setVisible(true);
        this.enemy.body.enable = true;
      }
    });
    socket.on("player disconnected", (player) => {
      if (this.enemy && this.enemy.id === player.id) {
        this.enemy.destroy();
        this.enemy = null;
      }
    });
    socket.on("player won", (player) => {
      if (player.id === socket.id) {
        console.log("YOU WON");

        this.add
          .text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "PLAYER DISCONNECTED, YOU WON!",
            {
              fontSize: "64px",
              color: "#ffffff",
              fontStyle: "bold",
            },
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(9999);
      }
    });
  }

  update() {
    const socket = this.game.socket;
    if (!this.player) {
      return;
    }
    this.player.update();

    this.healthbar.setPosition(this.player.x - 80, this.player.y - 120);

    if (this.enemy) {
      let aRange = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y,
      );

      if (
        aRange < 150 &&
        Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele)
      ) {
        socket.emit("player attack", "mele1");
      }
      if (
        aRange < 150 &&
        Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele2)
      ) {
        socket.emit("player attack", "mele2");
      }
    }

    let animation = null;
    if (this.player.anims.currentAnim) {
      animation = this.player.anims.currentAnim.key;
    }

    socket.emit("player movement", {
      x: this.player.x,
      y: this.player.y,
      velocityX: this.player.body.velocity.x,
      velocityY: this.player.body.velocity.y,
      flipX: this.player.flipX,
      animation: animation,
    });
    if (this.player.hasGem) {
      this.playerGem.setPosition(this.player.x, this.player.y - 80);
    }

    if (this.enemy && this.enemy.hasGem) {
      this.enemyGem.setPosition(this.enemy.x, this.enemy.y - 80);
    }
  }
}
