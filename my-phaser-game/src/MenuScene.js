import Phaser from "phaser";
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    console.log("menu scene");
  }

  init() {}

  preload() {
    this.load.image("titleBackground", "./src/assets/menubackground.png");
  }

  create() {
    const bg = this.add.image(0, 0, "titleBackground");
    bg.setOrigin(0, 0);

    this.add
      .text(400, 300, "Survivor Game", {
        fontSize: "35px",
      })
      .setOrigin(0.5);

    const campaign = this.add
      .text(500, 370, "Campaign", {
        fontSize: "20px",
      })
      .setOrigin(0.5)
      .setInteractive();
    campaign.on("pointerup", () => {
      console.log("campaign clicked");
      this.scene.start("MainScene");
    });

    const pvp = this.add
      .text(300, 370, "PVP", {
        fontSize: "20px",
      })
      .setOrigin(0.5)
      .setInteractive();
    pvp.on("pointerdown", () => {
      this.scene.start("PvPScene");
    });

    this.add
      .text(400, 470, "Click a mode to play!", {
        fontSize: "24px",
      })
      .setOrigin(0.5);
  }

  update() {}
}
