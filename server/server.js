const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store rooms data: roomId -> { socketId -> playerData }
const rooms = {};

app.use(cors());

io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (!roomId) {
    console.warn("Missing roomId. Disconnecting socket:", socket.id);
    return socket.disconnect(true);
  }

  console.log(`✅ Socket ${socket.id} connected to room ${roomId}`);
  socket.join(roomId);

  rooms[roomId] ||= {};

  // Send existing players to this socket
  socket.emit("playersUpdate", rooms[roomId]);

  // New player joins
  socket.on("newPlayer", ({ username, avatar }) => {
    rooms[roomId][socket.id] = {
      username,
      avatar,
      x: 400,
      y: 300,
      direction: "",
    };

    io.to(roomId).emit("playersUpdate", rooms[roomId]);
    console.log(`🟢 ${username} joined ${roomId}`);
  });

  // Player moves
  socket.on("move", ({ x, y, direction, avatar }) => {
    const player = rooms[roomId]?.[socket.id];
    if (player) {
      rooms[roomId][socket.id] = {
        ...player,
        x,
        y,
        direction,
        avatar,
      };

      io.to(roomId).emit("playersUpdate", rooms[roomId]);
    }
  });

  // Player disconnects
  socket.on("disconnect", () => {
    if (rooms[roomId]?.[socket.id]) {
      const username = rooms[roomId][socket.id]?.username || "A player";
      console.log(`❌ ${username} left room ${roomId}`);

      delete rooms[roomId][socket.id];

      io.to(roomId).emit("playersUpdate", rooms[roomId]);

      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
        console.log(`🧹 Room ${roomId} cleaned up (empty).`);
      }
    }
  });
});

server.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000");
});
