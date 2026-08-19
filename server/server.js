import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import db from "./db/client.js";
import seed from "./db/seed.js";
import commonRouter from "./api/commonapi.js";

const app = express();
//server creation
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(express.json());

app.use("/api", commonRouter);

const players = {};
let playerCount = 0;
io.on("connection", (socket) => {
  if (playerCount >= 2) {
    socket.disconnect();
    return;
  }
  playerCount++;
  let spawnX = 180;
  if (playerCount === 2) {
    spawnX = 400;
  }

  players[socket.id] = {
    id: socket.id,
    x: spawnX,
    y: 200,
    health: 100,
  };
  console.log("Players:", players);
  console.log("Player connected", socket.id);
  socket.emit("current players", players);
  socket.emit("player health and damage", {
    id: socket.id,
    health: players[socket.id].health,
  });
  socket.broadcast.emit("new player", players[socket.id]);

  socket.on("disconnect", () => {
    playerCount--;
    delete players[socket.id];
    console.log("Players:", players);
    console.log("Player disconnected", socket.id);
    io.emit("player disconnected", {
      id: socket.id,
    });
  });

  socket.on("player movement", (position) => {
    players[socket.id].x = position.x;
    players[socket.id].y = position.y;
    players[socket.id].velocityX = position.velocityX;
    players[socket.id].velocityY = position.velocityY;
    players[socket.id].animation = position.animation;
    players[socket.id].flipX = position.flipX;

    socket.broadcast.emit("player movement", {
      id: socket.id,
      x: position.x,
      y: position.y,
      velocityX: position.velocityX,
      velocityY: position.velocityY,
      animation: position.animation,
      flipX: position.flipX,
    });
  });
  socket.on("player attack", () => {
    console.log("player attacked", socket.id);
    const allPlayers = Object.values(players);
    const target = allPlayers.find((player) => {
      return player.id !== socket.id;
    });
    if (!target) {
      return;
    }
    target.health -= 50;
    if (target.health <= 0) {
      target.health = 0;
    }

    io.to(target.id).emit("player health and damage", {
      id: target.id,
      health: target.health,
    });

    io.emit("player damaged", {
      id: target.id,
    });

    if (target.health <= 0) {
      io.emit("player died", {
        id: target.id,
      });
    }
  });

  socket.on("player respawn", () => {
    players[socket.id].health = 100;
    players[socket.id].x = 400;
    players[socket.id].y = 350;

    socket.emit("player health and damage", {
      id: socket.id,
      health: 100,
    });
    io.emit("player respawned", {
      id: socket.id,
      x: players[socket.id].x,
      y: players[socket.id].y,
    });
  });
});

const init = async () => {
  await db.connect();
  await seed();
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`listening to port... ${PORT}`);
  });
};

init();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("error");
});
