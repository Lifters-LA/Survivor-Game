import Phaser from "phaser";
import { MainScene } from "./MainScene.js";
import { PvpScene } from "./pvpScene.js";
import { LobbyScene } from "./lobbyScene.js";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
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
  scene: [PvpScene, MainScene, LobbyScene],
};

const game = new Phaser.Game(config);
game.socket = socket;
//https://docs.phaser.io/phaser/concepts/physics/arcade
