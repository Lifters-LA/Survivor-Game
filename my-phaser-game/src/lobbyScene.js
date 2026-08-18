import Phaser from "phaser";

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  init(data) {
    this.roomCode = data.roomCode;
  }

  create() {
    const { width, height } = this.scale;

    // ============================
    // BACKGROUND
    // ============================

    this.cameras.main.setBackgroundColor("#101018");

    // ============================
    // MAIN PANEL
    // ============================

    this.add
      .rectangle(width / 2, height / 2, 520, 500, 0x181824)
      .setStrokeStyle(2, 0x6c63ff);

    // ============================
    // TITLE
    // ============================

    this.add
      .text(width / 2, 130, "PVP LOBBY", {
        fontSize: "42px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 200, "Waiting for the battle to begin", {
        fontSize: "17px",
        color: "#9999aa",
      })
      .setOrigin(0.5);

    // ============================
    // ROOM CODE LABEL
    // ============================

    this.add
      .text(width / 2, 245, "ROOM CODE", {
        fontSize: "16px",
        color: "#9999aa",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // ============================
    // ROOM CODE BOX
    // ============================

    this.add
      .rectangle(width / 2, 295, 300, 65, 0x20202f)
      .setStrokeStyle(2, 0x7c5cff);

    this.add
      .text(width / 2, 295, this.roomCode, {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // ============================
    // PLAYER STATUS
    // ============================

    this.add.circle(width / 2 - 135, 380, 7, 0x4dd4ac);

    this.add
      .text(width / 2 - 115, 380, "You are connected", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);

    // ============================
    // WAITING TEXT
    // ============================

    this.waitingText = this.add
      .text(width / 2, 440, "Waiting for another player...", {
        fontSize: "20px",
        color: "#4dd4ac",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // ============================
    // LOADING DOT ANIMATION
    // ============================

    let dots = 0;

    this.time.addEvent({
      delay: 500,
      loop: true,

      callback: () => {
        dots++;

        if (dots > 3) {
          dots = 0;
        }

        this.waitingText.setText(
          `Waiting for another player${".".repeat(dots)}`,
        );
      },
    });

    // ============================
    // ROOM START
    // ============================

    this.game.socket.once("startGame", (roomCode) => {
      console.log(`game started: ${roomCode}`);

      this.waitingText.setText("PLAYER FOUND!");

      this.waitingText.setColor("#ffffff");

      // Small delay so player sees
      // "PLAYER FOUND"
      this.time.delayedCall(700, () => {
        this.scene.start("MainScene", {
          roomCode,
        });
      });
    });
    this.game.socket.once("joinedOnline", (roomCode) => {
      this.scene.start("MainScene", {
        roomCode: roomCode,
      });
    });
    this.game.socket.emit("online");
  }
}
