import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#101018");

    this.add
      .rectangle(width / 2, height / 2, 500, 500, 0x181824)
      .setStrokeStyle(2, 0x6c63ff);

    this.add
      .text(width / 2, 100, "SURVIVOR-GAME", {
        fontSize: "42px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const onlineBtn = this.add
      .rectangle(width / 2, 220, 300, 65, 0x28283d)
      .setStrokeStyle(2, 0xffb84d)
      .setInteractive({ useHandCursor: true });

    const onlineText = this.add
      .text(width / 2, 220, "PLAY ONLINE", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    onlineBtn.on("pointerover", () => {
      onlineBtn.setFillStyle(0xffb84d);
    });

    onlineBtn.on("pointerout", () => {
      onlineBtn.setFillStyle(0x28283d);
    });

    onlineBtn.on("pointerdown", () => {
      this.playOnline();
    });

    const createBtn = this.add
      .rectangle(width / 2, 320, 300, 65, 0x28283d)
      .setStrokeStyle(2, 0x7c5cff)
      .setInteractive({ useHandCursor: true });

    const createText = this.add
      .text(width / 2, 320, "CREATE ROOM", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    createBtn.on("pointerover", () => {
      createBtn.setFillStyle(0x7c5cff);
    });

    createBtn.on("pointerout", () => {
      createBtn.setFillStyle(0x28283d);
    });

    createBtn.on("pointerdown", () => {
      this.hideMainButtons();
      this.createRoom();
    });

    const joinBtn = this.add
      .rectangle(width / 2, 420, 300, 65, 0x28283d)
      .setStrokeStyle(2, 0x4dd4ac)
      .setInteractive({ useHandCursor: true });

    const joinText = this.add
      .text(width / 2, 420, "JOIN ROOM", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    joinBtn.on("pointerover", () => {
      joinBtn.setFillStyle(0x4dd4ac);
    });

    joinBtn.on("pointerout", () => {
      joinBtn.setFillStyle(0x28283d);
    });

    joinBtn.on("pointerdown", () => {
      this.hideMainButtons();
      this.joinRoom();
    });

    // Save buttons so we can hide/show them later
    this.mainButtons = [
      onlineBtn,
      onlineText,
      createBtn,
      createText,
      joinBtn,
      joinText,
    ];
  }

  hideMainButtons() {
    this.mainButtons.forEach((object) => {
      object.setVisible(false);

      if (object.disableInteractive) {
        object.disableInteractive();
      }
    });
  }

  showMainButtons() {
    this.mainButtons.forEach((object) => {
      object.setVisible(true);
    });

    this.mainButtons[0].setInteractive({
      useHandCursor: true,
    });

    this.mainButtons[2].setInteractive({
      useHandCursor: true,
    });

    this.mainButtons[4].setInteractive({
      useHandCursor: true,
    });
  }

  createRoom() {
    const { width } = this.scale;

    const roomInput = document.createElement("input");

    roomInput.type = "text";
    roomInput.placeholder = "Create room code";

    roomInput.style.width = "280px";
    roomInput.style.height = "50px";
    roomInput.style.padding = "0 15px";
    roomInput.style.fontSize = "18px";
    roomInput.style.fontWeight = "bold";
    roomInput.style.color = "#ffffff";
    roomInput.style.backgroundColor = "#20202f";
    roomInput.style.border = "2px solid #7c5cff";
    roomInput.style.borderRadius = "10px";
    roomInput.style.outline = "none";
    roomInput.style.boxSizing = "border-box";
    roomInput.style.textAlign = "center";

    const domInput = this.add.dom(width / 2, 280, roomInput);

    // CREATE BUTTON

    const confirmButton = this.add
      .rectangle(width / 2, 365, 220, 60, 0x28283d)
      .setStrokeStyle(2, 0x7c5cff)
      .setInteractive({
        useHandCursor: true,
      });

    const confirmText = this.add
      .text(width / 2, 365, "CREATE", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    confirmButton.on("pointerover", () => {
      confirmButton.setFillStyle(0x7c5cff);
    });

    confirmButton.on("pointerout", () => {
      confirmButton.setFillStyle(0x28283d);
    });

    confirmButton.on("pointerdown", () => {
      const roomCode = roomInput.value.trim();

      if (!roomCode) {
        roomInput.style.border = "2px solid #ff4d6d";

        return;
      }

      this.game.socket.emit("createRoom", roomCode);
    });

    // BACK BUTTON

    const backButton = this.add
      .text(width / 2, 435, "BACK", {
        fontSize: "18px",
        color: "#9999aa",
      })
      .setOrigin(0.5)
      .setInteractive({
        useHandCursor: true,
      });

    backButton.on("pointerover", () => {
      backButton.setColor("#ffffff");
    });

    backButton.on("pointerout", () => {
      backButton.setColor("#9999aa");
    });

    backButton.on("pointerdown", () => {
      domInput.destroy();
      confirmButton.destroy();
      confirmText.destroy();
      backButton.destroy();

      this.showMainButtons();
    });

    this.game.socket.once("roomCreated", (roomCode) => {
      this.scene.start("LobbyScene", {
        roomCode,
      });
    });
  }

  joinRoom() {
    const { width } = this.scale;

    const roomInput = document.createElement("input");

    roomInput.type = "text";
    roomInput.placeholder = "Enter room code";

    roomInput.style.width = "280px";
    roomInput.style.height = "50px";
    roomInput.style.padding = "0 15px";
    roomInput.style.fontSize = "18px";
    roomInput.style.fontWeight = "bold";
    roomInput.style.color = "#ffffff";
    roomInput.style.backgroundColor = "#20202f";
    roomInput.style.border = "2px solid #4dd4ac";
    roomInput.style.borderRadius = "10px";
    roomInput.style.outline = "none";
    roomInput.style.boxSizing = "border-box";
    roomInput.style.textAlign = "center";

    const domInput = this.add.dom(width / 2, 280, roomInput);

    // JOIN BUTTON

    const confirmButton = this.add
      .rectangle(width / 2, 365, 220, 60, 0x28283d)
      .setStrokeStyle(2, 0x4dd4ac)
      .setInteractive({
        useHandCursor: true,
      });

    const confirmText = this.add
      .text(width / 2, 365, "JOIN", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    confirmButton.on("pointerover", () => {
      confirmButton.setFillStyle(0x4dd4ac);
    });

    confirmButton.on("pointerout", () => {
      confirmButton.setFillStyle(0x28283d);
    });

    confirmButton.on("pointerdown", () => {
      const roomCode = roomInput.value.trim();

      if (!roomCode) {
        roomInput.style.border = "2px solid #ff4d6d";

        return;
      }

      this.game.socket.emit("joinRoom", roomCode);
    });

    // BACK BUTTON

    const backButton = this.add
      .text(width / 2, 435, "BACK", {
        fontSize: "18px",
        color: "#9999aa",
      })
      .setOrigin(0.5)
      .setInteractive({
        useHandCursor: true,
      });

    backButton.on("pointerover", () => {
      backButton.setColor("#ffffff");
    });

    backButton.on("pointerout", () => {
      backButton.setColor("#9999aa");
    });

    backButton.on("pointerdown", () => {
      domInput.destroy();
      confirmButton.destroy();
      confirmText.destroy();
      backButton.destroy();

      this.showMainButtons();
    });

    this.game.socket.once("roomJoined", (roomCode) => {
      this.scene.start("LobbyScene", {
        roomCode,
      });
    });

    this.game.socket.once("startGame", (roomCode) => {
      this.scene.start("MainScene", {
        roomCode,
      });
    });
  }

  // ============================
  // PLAY ONLINE
  // ============================

  playOnline() {
    this.scene.start("LobbyScene", {
      roomCode: "MATCHMAKING",
    });
  }
}
