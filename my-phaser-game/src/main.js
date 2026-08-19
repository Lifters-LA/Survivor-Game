import Phaser from "phaser";
import { MainScene } from "./MainScene.js";
import { PvPScene } from "./PvPScene.js";
const config = {
  type: Phaser.AUTO,
  width: 810,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 200 }, // Pulls bodies down
      debug: true,
    },
  },
  scene: [PvPScene, MainScene],
  scale: {
    zoom: 1,
  },
};

const game = new Phaser.Game(config);
//https://docs.phaser.io/phaser/concepts/physics/arcade
