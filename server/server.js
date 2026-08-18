import express from "express";
import db from "./db/client.js";
import seed from "./db/seed.js";
import commonRouter from "./api/commonapi.js";
import { Server } from "socket.io";

const app = express();

app.use(express.json());

app.use("/api", commonRouter);

await db.connect();
await seed();
const PORT = 3000;
const httpServer = app.listen(PORT, () => {
  console.log(`listening to port... ${PORT}`);
});

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const waitingList = [];

io.on("connection", (socket) => {
  console.log("socket has connected");

  socket.on("online", () => {
    console.log("waiting to get connected");
    waitingList.push(socket);
    if (waitingList.length >= 2) {
      const player1 = waitingList.shift();
      const player2 = waitingList.shift();

      const roomCode = Date.now();

      player1.join(roomCode);
      player2.join(roomCode);
      io.to(roomCode).emit("joinedOnline", roomCode);
    }
  });

  socket.on("joinRoom", (roomCode) => {
    const room = io.sockets.adapter.rooms.get(roomCode);

    if (!room) {
      socket.emit("roomError", "Room does not exist");
      return;
    }

    if (room.size === 2) {
      socket.emit("roomError", "room full");
      return;
    }
    socket.join(roomCode);

    const updatedRooms = io.sockets.adapter.rooms.get(roomCode);

    if (updatedRooms.size === 2) {
      io.to(roomCode).emit("startGame", roomCode);
      return;
    }
    socket.emit("roomJoined", roomCode);
  });

  socket.on("createRoom", (roomCode) => {
    const room = io.sockets.adapter.rooms.get(roomCode);

    if (room) {
      socket.emit("roomError", "Room already exist");
      return;
    }

    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("error");
});
