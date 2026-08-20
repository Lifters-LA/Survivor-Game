import Phaser from "phaser";
import { MainScene } from "./MainScene.js";
import { MenuScene } from "./MenuScene.js";
import { LobbyScene } from "./lobbyScene.js";
import { io } from "socket.io-client";

import { PvPScene } from "./PvPScene.js";
const config = {
  type: Phaser.AUTO,

  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 225 }, // Pulls bodies down
      debug: true,
    },
  },
  scene: [PvPScene, MainScene, LobbyScene, MenuScene],

  scale: {
    zoom: 1,
  },
};

const game = new Phaser.Game(config);

//https://docs.phaser.io/phaser/concepts/physics/arcade
