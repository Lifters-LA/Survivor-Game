import Phaser from "phaser";
import { MenuScene } from "./MenuScene.js";
import { LobbyScene } from "./lobbyScene.js";
import { io } from "socket.io-client";
import "./style.css";

const socket = io(
  import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://survivor-game-mx9w.onrender.com",
);

import { PvPScene } from "./PvPScene.js";
const config = {
  type: Phaser.AUTO,

  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1000,
    height: 600,
  },
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 225 }, // Pulls bodies down
      debug: false,
    },
  },
  scene: [MenuScene, LobbyScene, PvPScene],
};

const game = new Phaser.Game(config);
game.socket = socket;
//https://docs.phaser.io/phaser/concepts/physics/arcade
