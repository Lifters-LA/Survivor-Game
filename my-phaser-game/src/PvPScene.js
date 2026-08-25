import Phaser from "phaser";
import { Player } from "./Player";
import HealthBar from "./Healthbar.js";
import { Enemy } from "./Enemy.js";

export class PvPScene extends Phaser.Scene {
  constructor() {
    super("PvPScene");
    console.log("pvp scene");
  }
  init(data) {
    this.roomCode = data.roomCode;
  }

  preload() {
    //sound
    this.load.audio("gameMusic", "/assets/zombie-castle.mp3");
    this.load.audio("gemPickup", "/assets/gem.wav");

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
    this.load.spritesheet("items", "/assets/items.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("player", "/assets/wknight.png");
    this.load.image("enemy", "/assets/brzombie.png");

    this.load.atlas(
      "wknight",
      "/assets/wknight.png",
      "/assets/wknight_atlas.json",
    );
    this.load.atlas(
      "brzombie",
      "/assets/brzombie.png",
      "/assets/brzombie_atlas.json",
    );
    this.load.animation("wknight_anim", "/assets/wknight_anim.json");
    this.load.animation("brzombie_anim", "/assets/brzombie_anim.json");
  }

  create() {
    this.gameOver = false;
    this.player = null;
    this.enemy = null;

    this.music = this.sound.add("gameMusic", {
      loop: true,
      volume: 0.1,
    });

    this.music.play();
    this.events.once("shutdown", () => {
      if (this.music) {
        this.music.stop();
        this.music.destroy();
        this.music = null;
      }
    });
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
    this.enemies = {};

    socket.on("current enemies", (enemies) => {
      Object.values(enemies).forEach((enemyData) => {
        const enemy = new Enemy(this, enemyData.x, enemyData.y, "brzombie");
        enemy.id = enemyData.id;
        enemy.health = enemyData.health;

        enemy.setScale(3);
        enemy.setCollideWorldBounds(true);

        enemy.body.setAllowGravity(false);

        enemy.body.setSize(22, 42);
        enemy.body.setOffset(18, 22);

        // ADD COLLIDERS HERE
        this.physics.add.collider(enemy, tileLayer1);
        this.physics.add.collider(enemy, tileLayer2);

        this.enemies[enemyData.id] = enemy;
      });
    });

    this.leftPortal = this.physics.add.sprite(200, 1300, "items", 57);
    this.leftPortal.setScale(6);
    this.leftPortal.setDepth(900);

    this.rightPortal = this.physics.add.sprite(3000, 1300, "items", 57);
    this.rightPortal.setScale(6);
    this.rightPortal.setDepth(900);

    this.physics.add.collider(this.leftPortal, tileLayer1);
    this.physics.add.collider(this.leftPortal, tileLayer2);

    this.physics.add.collider(this.rightPortal, tileLayer1);
    this.physics.add.collider(this.rightPortal, tileLayer2);

    this.tweens.add({
      targets: [this.leftPortal, this.rightPortal],
      alpha: 0.15,
      duration: 100,
      yoyo: true,
      repeat: -1,
    });

    socket.on("current players", (players) => {
      console.log("players:", players);
      console.log("socket.id:", socket.id);

      Object.values(players).forEach((player) => {
        console.log("checking player:", player.id);

        if (player.id === socket.id) {
          console.log("MATCHED PLAYER");

          this.player = new Player(this, player.x, player.y, "wknight");
          this.player.hasGem = false;
          this.player.side = player.side;
          this.player.shieldHealth = 100;

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
          Object.values(this.enemies).forEach((zombie) => {
            zombie.player = this.player;
          });

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
          this.physics.add.overlap(this.player, this.leftPortal, () => {
            if (
              this.player.hasGem &&
              this.player.side === "left" &&
              !this.gameOver
            ) {
              this.gameOver = true;

              console.log("LEFT PLAYER BROUGHT GEM HOME!");

              socket.emit("player won", {
                roomCode: this.roomCode,
              });
            }
          });

          this.physics.add.overlap(this.player, this.rightPortal, () => {
            if (
              this.player.hasGem &&
              this.player.side === "right" &&
              !this.gameOver
            ) {
              this.gameOver = true;

              console.log("RIGHT PLAYER BROUGHT GEM HOME!");

              socket.emit("player won", {
                roomCode: this.roomCode,
              });
            }
          });
        } else {
          console.log("CREATING ENEMY FROM CURRENT PLAYERS");

          this.enemy = new Player(this, player.x, player.y, "wknight");
          this.enemy.hasGem = false;
          this.enemy.side = player.side;
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
      socket.emit("getCurrentEnemies", this.roomCode);
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
        this.sound.play("gemPickup");

        if (this.enemy) {
          this.enemy.hasGem = false;
          this.enemyGem.setVisible(false);
        }
        Object.values(this.enemies).forEach((zombie) => {
          zombie.target = this.player;
        });
      } else if (this.enemy && player.id === this.enemy.id) {
        this.enemy.hasGem = true;
        this.enemyGem.setVisible(true);

        this.player.hasGem = false;
        this.playerGem.setVisible(false);
        Object.values(this.enemies).forEach((zombie) => {
          zombie.target = this.enemy;
        });
      }
    });
    //listen for health and damage
    socket.on("player health and damage", (player) => {
      if (player.id === socket.id) {
        this.healthbar.setHealth(player.health);
        this.player.shieldHealth = player.shieldHealth;

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
    socket.on("zombie damaged", ({ enemyId }) => {
      const zombie = this.enemies[enemyId];

      if (!zombie) {
        return;
      }

      zombie.showHit();
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
      Object.values(this.enemies).forEach((zombie) => {
        zombie.target = null;
      });

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
    socket.on("enemy state", (serverEnemies) => {
      // ==========================
      // UPDATE EXISTING ZOMBIES
      // ==========================

      Object.values(serverEnemies).forEach((enemyData) => {
        const zombie = this.enemies[enemyData.id];

        if (!zombie) {
          return;
        }

        zombie.updateFromServer(enemyData);
      });

      // ==========================
      // REMOVE DEAD ZOMBIES
      // ==========================

      Object.keys(this.enemies).forEach((enemyId) => {
        if (!serverEnemies[enemyId]) {
          this.enemies[enemyId].destroy();
          delete this.enemies[enemyId];
        }
      });
    });

    socket.on("player respawned", (player) => {
      if (player.id === socket.id) {
        this.player.setPosition(player.x, player.y);

        this.player.setVisible(true);

        this.player.body.enable = true;
      } else if (this.enemy) {
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
      this.gameOver = true;

      const resultText = player.id === socket.id ? "YOU WON!" : "YOU LOSE!";

      console.log(resultText);

      this.player.body.setVelocity(0, 0);

      this.add
        .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY - 100,
          resultText,
          {
            fontSize: "64px",
            color: "#ffffff",
            fontStyle: "bold",
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(9999);
      const buttonX = this.cameras.main.centerX;
      const buttonY = this.cameras.main.centerY + 100;

      // shadow
      const returnMenuShadow = this.add
        .rectangle(buttonX + 4, buttonY + 4, 300, 70, 0x000000, 0.35)
        .setScrollFactor(0)
        .setDepth(9998);

      // main button
      const returnMenuBg = this.add
        .rectangle(buttonX, buttonY, 300, 70, 0x2b2d42)
        .setStrokeStyle(4, 0xf9c74f)
        .setScrollFactor(0)
        .setDepth(9999)
        .setInteractive({ useHandCursor: true });

      // text
      const returnMenuText = this.add
        .text(buttonX, buttonY, "RETURN TO MENU", {
          fontSize: "28px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(10000);

      // hover effect
      returnMenuBg.on("pointerover", () => {
        returnMenuBg.setFillStyle(0x3a3d5c);
        returnMenuBg.setStrokeStyle(4, 0xffd166);
        returnMenuText.setScale(1.05);
      });

      returnMenuBg.on("pointerout", () => {
        returnMenuBg.setFillStyle(0x2b2d42);
        returnMenuBg.setStrokeStyle(4, 0xf9c74f);
        returnMenuText.setScale(1);
      });

      // click effect
      returnMenuBg.on("pointerdown", () => {
        returnMenuBg.setFillStyle(0x1f2233);
        returnMenuText.setScale(0.98);

        this.time.delayedCall(100, () => {
          socket.emit("leave game");

          this.scene.start("MenuScene");
        });
      });
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      socket.off("current enemies");
      socket.off("current players");
      socket.off("new player");
      socket.off("player movement");
      socket.off("gem picked up");
      socket.off("player health and damage");
      socket.off("zombie damaged");
      socket.off("player damaged");
      socket.off("gem dropped");
      socket.off("player died");
      socket.off("enemy state");
      socket.off("player respawned");
      socket.off("player disconnected");
      socket.off("player won");
    });
  }
  update() {
    const socket = this.game.socket;

    if (this.gameOver) {
      return;
    }

    if (!this.player) {
      return;
    }

    // Update local player
    this.player.update();

    // ==========================
    // CHECK ATTACK BUTTONS ONCE
    // ==========================

    const mele1Pressed = Phaser.Input.Keyboard.JustDown(
      this.player.inputKeys.mele,
    );

    const mele2Pressed = Phaser.Input.Keyboard.JustDown(
      this.player.inputKeys.mele2,
    );

    // ==========================
    // ATTACK OTHER PLAYER
    // ==========================
    const shielding =
      this.player.inputKeys.down.isDown && this.player.shieldHealth > 0;

    if (shielding) {
      this.player.setTint(0x0000ff);
    } else {
      this.player.clearTint();
    }

    socket.emit("player shielding", shielding);

    this.healthbar.setPosition(this.player.x - 80, this.player.y - 120);

    if (this.enemy) {
      const playerRange = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y,
      );

      if (playerRange < 150 && mele1Pressed) {
        socket.emit("player attack", "mele1");
      }

      if (playerRange < 150 && mele2Pressed) {
        socket.emit("player attack", "mele2");
      }
    }

    // ==========================
    // ATTACK ZOMBIES
    // ==========================

    Object.values(this.enemies).forEach((zombie) => {
      if (!zombie.active || zombie.health <= 0) return;

      const zombieRange = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        zombie.x,
        zombie.y,
      );
      const facingZombie =
        (this.player.direction === "left" && zombie.x < this.player.x) ||
        (this.player.direction === "right" && zombie.x > this.player.x);

      if (zombieRange < 150 && mele1Pressed) {
        socket.emit("zombie hit", {
          roomCode: this.roomCode,
          enemyId: zombie.id,
        });
      }
      if (zombieRange < 150 && mele2Pressed) {
        socket.emit("zombie hit", {
          roomCode: this.roomCode,
          enemyId: zombie.id,
        });
      }
    });

    // ==========================
    // HEALTH BAR
    // ==========================

    this.healthbar.setPosition(this.player.x - 80, this.player.y - 120);

    // ==========================
    // SEND MOVEMENT
    // ==========================

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

    // ==========================
    // GEM POSITION
    // ==========================

    if (this.player.hasGem) {
      this.playerGem.setPosition(this.player.x, this.player.y - 80);
    }

    if (this.enemy && this.enemy.hasGem) {
      this.enemyGem.setPosition(this.enemy.x, this.enemy.y - 80);
    }
  }
}
