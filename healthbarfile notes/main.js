import { GameScene } from "./src/scenes/Gamescene.js";
const config = {
  type: Phaser.AUTO,
  scene: [GameScene],
  scale: {
    width: 640,
    height: 360,
    mode: Phaser.Scale.FIT,
  },
  backgroundColor: "#028af8",

  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },
      debug: false,
    },
  },
};
const game = new Phaser.Game(config);
