import Phaser from "phaser";
import { MainScene } from "./MainScene.js";
const config = {
  type: Phaser.AUTO,
  width: 810,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 225 }, // Pulls bodies down
      debug: false,
    },
  },
  scene: [MainScene],
  scale: {
    zoom: 1,
  },
};

const game = new Phaser.Game(config);
//https://docs.phaser.io/phaser/concepts/physics/arcade
