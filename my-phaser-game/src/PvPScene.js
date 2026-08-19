import { io } from "socket.io-client";
import Phaser from "phaser";
import { Player } from "./Player";
import HealthBar from "./Healthbar.js";
const socket = io("http://localhost:3000", {
  autoConnect: false,
});

export class PvPScene extends Phaser.Scene {
  constructor() {
    super("PvPScene");
    console.log("pvp scene");
  }

  init() {}

  preload() {
    this.load.image("testPlatform", "./src/assets/testplatform.png");
    this.load.atlas(
      "wknight",
      "./src/assets/wknight.png",
      "./src/assets/wknight_atlas.json",
    );
    this.load.animation("wknight_anim", "./src/assets/wknight_anim.json");
  }

  create() {
    const tp = this.physics.add.staticGroup();
    tp.create(400, 500, "testPlatform").setScale(3).refreshBody();
    ////player
    this.player = new Player(this, 300, 350, "wknight");
    this.player.setScale(3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(9000);
    this.player.setBounce(0.2);
    this.player.body.onCollide = true;
    this.physics.add.collider(this.player, tp);

    //health bar
    this.healthbar = new HealthBar(this, 50, 50, 200, 20);
    //this.healthbar.setHealth(49);

    socket.on("current players", (players) => {
      Object.values(players).forEach((player) => {
        if (player.id !== socket.id) {
          this.enemy = new Player(this, player.x, player.y, "wknight");
          this.enemy.id = player.id;
          this.enemy.setScale(3);
          this.enemy.setCollideWorldBounds(true);
          this.enemy.body.setGravityY(9000);
          this.enemy.setBounce(0.2);
          this.enemy.body.onCollide = true;
          this.physics.add.collider(this.enemy, tp);
        }
      });
    });

    socket.on("new player", (player) => {
      console.log("new player recieved", player);
      if (this.enemy) {
        this.enemy.destroy();
      }
      this.enemy = new Player(this, player.x, player.y, "wknight");
      this.enemy.id = player.id;
      this.enemy.setScale(3);
      this.enemy.setCollideWorldBounds(true);
      this.enemy.body.setGravityY(9000);
      this.enemy.setBounce(0.2);
      this.enemy.body.onCollide = true;
      this.physics.add.collider(this.enemy, tp);
      this.physics.add.collider(this.enemy, this.player);
    });

    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      mele: Phaser.Input.Keyboard.KeyCodes.SPACE,
      mele2: Phaser.Input.Keyboard.KeyCodes.C,
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

    //listen for health and damage
    socket.on("player health and damage", (player) => {
      if (player.id === socket.id) {
        this.healthbar.setHealth(player.health);

        if (player.health <= 0) {
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

    socket.connect();
  }

  update() {
    this.player.update();
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
        socket.emit("player attack");
      }
      if (
        aRange < 150 &&
        Phaser.Input.Keyboard.JustDown(this.player.inputKeys.mele2)
      ) {
        socket.emit("player attack");
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
  }
}
