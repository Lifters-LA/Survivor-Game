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

const waitingList = [];
const players = {};
const gems = {};

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("online", () => {
    console.log("waiting to get connected:", socket.id);

    waitingList.push(socket);

    if (waitingList.length >= 2) {
      const player1 = waitingList.shift();
      const player2 = waitingList.shift();

      const roomCode = String(Date.now());

      player1.join(roomCode);
      player2.join(roomCode);
      gems[roomCode] = {
        ownerId: null,
        x: 500,
        y: 300,
      };

      // PLAYER 1 - LEFT
      players[player1.id] = {
        id: player1.id,
        roomCode,
        side: "left",
        x: 180,
        y: 1000,
        health: 100,
      };

      // PLAYER 2 - RIGHT
      players[player2.id] = {
        id: player2.id,
        roomCode,
        side: "right",
        x: 3000,
        y: 1000,
        health: 100,
      };

      io.to(roomCode).emit("joinedOnline", roomCode);
    }
  });
  socket.on("getCurrentPlayers", (roomCode) => {
    const roomPlayers = {};

    Object.values(players).forEach((player) => {
      if (player.roomCode === roomCode) {
        roomPlayers[player.id] = player;
      }
    });

    socket.emit("current players", roomPlayers);
  });

  // MOVEMENT
  socket.on("player movement", (position) => {
    const player = players[socket.id];

    if (!player) {
      return;
    }

    player.x = position.x;
    player.y = position.y;
    player.velocityX = position.velocityX;
    player.velocityY = position.velocityY;
    player.animation = position.animation;
    player.flipX = position.flipX;

    socket.to(player.roomCode).emit("player movement", {
      id: socket.id,
      x: position.x,
      y: position.y,
      velocityX: position.velocityX,
      velocityY: position.velocityY,
      animation: position.animation,
      flipX: position.flipX,
    });
  });

  // ATTACK
  socket.on("player attack", (attack) => {
    const attacker = players[socket.id];

    if (!attacker) {
      return;
    }

    const target = Object.values(players).find((player) => {
      return player.roomCode === attacker.roomCode && player.id !== socket.id;
    });

    if (!target) {
      return;
    }
    if (attack === "mele1") {
      target.health -= 25;
    }

    if (attack === "mele2") {
      target.health -= 50;
    }

    if (target.health <= 0) {
      target.health = 0;
    }

    io.to(target.id).emit("player health and damage", {
      id: target.id,
      health: target.health,
    });

    io.to(attacker.roomCode).emit("player damaged", {
      id: target.id,
    });

    if (target.health <= 0) {
      io.to(attacker.roomCode).emit("player died", {
        id: target.id,
      });
    }
  });

  // RESPAWN
  socket.on("player respawn", () => {
    const player = players[socket.id];

    if (!player) {
      return;
    }

    player.health = 100;

    // Spawn depending on which side this player originally belongs to
    player.x = player.x <= 290 ? 180 : 400;
    player.y = 200;

    socket.emit("player health and damage", {
      id: socket.id,
      health: 100,
    });

    io.to(player.roomCode).emit("player respawned", {
      id: socket.id,
      x: player.x,
      y: player.y,
    });
  });

  socket.on("gem picked up", ({ roomCode }) => {
    const player = players[socket.id];

    if (!player) {
      return;
    }

    const gem = gems[roomCode];

    if (!gem) {
      return;
    }

    // Someone already has the gem
    if (gem.ownerId !== null) {
      return;
    }

    // Make sure this player actually belongs to this room
    if (player.roomCode !== roomCode) {
      return;
    }

    gem.ownerId = socket.id;

    io.to(roomCode).emit("gem picked up", {
      id: socket.id,
    });
  });

  socket.on("gem dropped", ({ roomCode, x, y }) => {
    const player = players[socket.id];

    if (!player) {
      return;
    }

    const gem = gems[roomCode];

    if (!gem) {
      return;
    }

    // Only the player carrying the gem can drop it
    if (gem.ownerId !== socket.id) {
      return;
    }

    gem.ownerId = null;
    gem.x = x;
    gem.y = y;

    io.to(roomCode).emit("gem dropped", {
      x,
      y,
    });
  });

  socket.on("player won", ({ roomCode }) => {
    const player = players[socket.id];

    if (!player) {
      return;
    }

    if (player.roomCode !== roomCode) {
      return;
    }

    const gem = gems[roomCode];

    if (!gem) {
      return;
    }

    // Player must actually be carrying the gem
    if (gem.ownerId !== socket.id) {
      return;
    }

    io.to(roomCode).emit("player won", {
      id: socket.id,
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const player = players[socket.id];

    if (player) {
      const roomCode = player.roomCode;
      const gem = gems[roomCode];

      if (gem && gem.ownerId === socket.id) {
        gem.ownerId = null;
        gem.x = player.x;
        gem.y = player.y;

        io.to(roomCode).emit("gem dropped", {
          x: player.x,
          y: player.y,
        });
      }

      delete players[socket.id];

      const remainingPlayers = Object.values(players).filter((p) => {
        return p.roomCode === roomCode;
      });

      io.to(roomCode).emit("player disconnected", {
        id: socket.id,
      });

      if (remainingPlayers.length === 1) {
        io.to(remainingPlayers[0].id).emit("player won", {
          id: remainingPlayers[0].id,
        });
      }
    }

    const waitingIndex = waitingList.findIndex(
      (waitingSocket) => waitingSocket.id === socket.id,
    );

    if (waitingIndex !== -1) {
      waitingList.splice(waitingIndex, 1);
    }

    console.log("socket disconnected:", socket.id);
  });

  /////////////////////////////////////////////////////////////////////////////////////////
  socket.on("joinRoom", (roomCode) => {
    const room = io.sockets.adapter.rooms.get(roomCode);

    if (!room) {
      socket.emit("roomError", "Room does not exist");
      return;
    }

    if (room.size >= 2) {
      socket.emit("roomError", "Room full");
      return;
    }

    socket.join(roomCode);
    gems[roomCode] = {
      ownerId: null,
      x: 500,
      y: 300,
    };

    players[socket.id] = {
      id: socket.id,
      roomCode,
      x: 400,
      y: 200,
      health: 100,
    };

    socket.emit("roomJoined", roomCode);

    const updatedRoom = io.sockets.adapter.rooms.get(roomCode);

    if (updatedRoom.size === 2) {
      io.to(roomCode).emit("startGame", roomCode);
    }
  });

  socket.on("createRoom", (roomCode) => {
    const room = io.sockets.adapter.rooms.get(roomCode);

    if (room) {
      socket.emit("roomError", "Room already exists");
      return;
    }

    socket.join(roomCode);

    players[socket.id] = {
      id: socket.id,
      roomCode,
      x: 180,
      y: 200,
      health: 100,
    };

    socket.emit("roomCreated", roomCode);
  });
  //////////////////////////////////////////////////
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
