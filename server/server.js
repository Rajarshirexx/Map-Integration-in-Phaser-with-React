const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let players = {};

app.use(cors());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send current players to new client
  socket.emit("playersUpdate", players);

  socket.on("newPlayer", ({ username, avatar }) => {
    players[socket.id] = {
      username,
      avatar,
      x: 400,
      y: 300,
      direction: "",
    };
    io.emit("playersUpdate", players);
  });

  socket.on("move", ({ x, y, direction, avatar }) => {
    if (players[socket.id]) {
      players[socket.id].x = x;
      players[socket.id].y = y;
      players[socket.id].direction = direction;
      players[socket.id].avatar = avatar /* || players[socket.id].avatar */;

      io.emit("playersUpdate", players);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    io.emit("playersUpdate", players);
  });
});

server.listen(4000, () => {
  console.log("Server listening on http://localhost:4000");
});
