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
const enemies = {};

function createEnemies(roomCode) {
  enemies[roomCode] = {
    enemy1: {
      id: "enemy1",
      roomCode,
      x: 500,
      y: 900,
      health: 3,

      animation: "idle",
      flipX: false,

      patrolDirection: 1,
      patrolLeft: 300,
      patrolRight: 700,

      lastAttackTime: 0,
    },

    enemy2: {
      id: "enemy2",
      roomCode,
      x: 900,
      y: 700,
      health: 3,

      animation: "idle",
      flipX: false,

      patrolDirection: 1,
      patrolLeft: 700,
      patrolRight: 1100,

      lastAttackTime: 0,
    },

    enemy3: {
      id: "enemy3",
      roomCode,
      x: 1300,
      y: 1000,
      health: 3,

      animation: "idle",
      flipX: false,

      patrolDirection: 1,
      patrolLeft: 1100,
      patrolRight: 1500,

      lastAttackTime: 0,
    },

    enemy4: {
      id: "enemy4",
      roomCode,
      x: 1800,
      y: 800,
      health: 3,

      animation: "idle",
      flipX: false,

      patrolDirection: 1,
      patrolLeft: 1600,
      patrolRight: 2000,

      lastAttackTime: 0,
    },

    enemy5: {
      id: "enemy5",
      roomCode,
      x: 2300,
      y: 950,
      health: 3,

      animation: "idle",
      flipX: false,

      patrolDirection: 1,
      patrolLeft: 2100,
      patrolRight: 2500,

      lastAttackTime: 0,
    },

    enemy6: {
      id: "enemy6",
      roomCode,
      x: 2700,
      y: 750,
      health: 3,

      animation: "idle",
      flipX: false,

      patrolDirection: 1,
      patrolLeft: 2500,
      patrolRight: 2900,

      lastAttackTime: 0,
    },
  };
}
const ZOMBIE_PATROL_SPEED = 1;
const ZOMBIE_SPEED = 3;
const ZOMBIE_CHASE_RANGE = 300;
const ZOMBIE_ATTACK_RANGE = 90;
const ZOMBIE_DAMAGE = 10;
const ZOMBIE_ATTACK_COOLDOWN = 1000;
const ZOMBIE_GEM_SPEED = 4;

function getRoomPlayers(roomCode) {
  return Object.values(players).filter((player) => {
    return player.roomCode === roomCode;
  });
}

function patrolZombie(enemy) {
  enemy.animation = "walk";

  enemy.x += ZOMBIE_PATROL_SPEED * enemy.patrolDirection;

  // Moving right
  if (enemy.patrolDirection === 1) {
    enemy.flipX = true;
  } else {
    enemy.flipX = false;
  }

  if (enemy.x >= enemy.patrolRight) {
    enemy.x = enemy.patrolRight;
    enemy.patrolDirection = -1;
  }

  if (enemy.x <= enemy.patrolLeft) {
    enemy.x = enemy.patrolLeft;
    enemy.patrolDirection = 1;
  }
}
function updateZombie(enemy, roomCode) {
  const roomPlayers = getRoomPlayers(roomCode);

  const gem = gems[roomCode];

  let target = null;
  let currentSpeed = ZOMBIE_SPEED;

  if (gem && gem.ownerId) {
    currentSpeed = ZOMBIE_GEM_SPEED;
  }

  // =====================================
  // GEM HOLDER ALWAYS GETS TARGETED
  // =====================================

  if (gem && gem.ownerId) {
    const gemHolder = players[gem.ownerId];

    if (gemHolder && gemHolder.health > 0) {
      target = gemHolder;
    }
  }

  // =====================================
  // NO GEM HOLDER
  // FIND CLOSEST PLAYER IN RANGE
  // =====================================

  if (!target) {
    let closestPlayer = null;
    let closestDistance = Infinity;

    roomPlayers.forEach((player) => {
      if (player.health <= 0) {
        return;
      }

      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ZOMBIE_CHASE_RANGE && distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });

    target = closestPlayer;
  }

  // =====================================
  // NOBODY TO CHASE
  // =====================================

  if (!target) {
    patrolZombie(enemy);
    return;
  }

  // =====================================
  // CHASE TARGET
  // =====================================

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;

  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance <= ZOMBIE_ATTACK_RANGE) {
    enemy.animation = "attack";

    zombieAttack(enemy, target, roomCode);

    return;
  }

  if (distance === 0) {
    return;
  }

  enemy.animation = "walk";

  const normalizedX = dx / distance;
  const normalizedY = dy / distance;

  enemy.x += normalizedX * currentSpeed;
  enemy.y += normalizedY * currentSpeed;

  if (dx > 0) {
    enemy.flipX = true;
  } else {
    enemy.flipX = false;
  }
}

function zombieAttack(enemy, target, roomCode) {
  const now = Date.now();

  // stop zombie from damaging every 20ms
  if (now - enemy.lastAttackTime < ZOMBIE_ATTACK_COOLDOWN) {
    return;
  }

  enemy.lastAttackTime = now;

  target.health -= ZOMBIE_DAMAGE;

  if (target.health < 0) {
    target.health = 0;
  }

  console.log(enemy.id, "attacked", target.id, "health:", target.health);

  io.to(target.id).emit("player health and damage", {
    id: target.id,
    health: target.health,
  });

  io.to(roomCode).emit("player damaged", {
    id: target.id,
  });

  if (target.health <= 0) {
    io.to(roomCode).emit("player died", {
      id: target.id,
    });
  }
}

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("online", () => {
    console.log("waiting to get connected:", socket.id);

    waitingList.push(socket);

    if (waitingList.length >= 2) {
      const player1 = waitingList.shift();
      const player2 = waitingList.shift();

      const roomCode = String(Date.now());
      createEnemies(roomCode);

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
  socket.on("zombie hit", ({ roomCode, enemyId }) => {
    const roomEnemies = enemies[roomCode];

    if (!roomEnemies) {
      return;
    }

    const enemy = roomEnemies[enemyId];

    if (!enemy) {
      return;
    }

    enemy.health -= 1;

    console.log(enemyId, "health:", enemy.health);
    io.to(roomCode).emit("zombie damaged", {
      enemyId: enemy.id,
    });

    if (enemy.health <= 0) {
      delete roomEnemies[enemyId];
    }

    io.to(roomCode).emit("enemy state", roomEnemies);
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
  socket.on("getCurrentEnemies", (roomCode) => {
    socket.emit("current enemies", enemies[roomCode]);
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

  socket.on("leave game", () => {
    const player = players[socket.id];

    if (!player) {
      return;
    }

    const roomCode = player.roomCode;

    // Remove player from server game state
    delete players[socket.id];

    // Leave the Socket.IO room
    socket.leave(roomCode);

    console.log(socket.id, "left room", roomCode);
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
    createEnemies(roomCode);

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

setInterval(() => {
  Object.entries(enemies).forEach(([roomCode, roomEnemies]) => {
    Object.values(roomEnemies).forEach((enemy) => {
      updateZombie(enemy, roomCode);
    });

    io.to(roomCode).emit("enemy state", roomEnemies);
  });
}, 20);

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
