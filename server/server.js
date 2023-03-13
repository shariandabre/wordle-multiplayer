const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const words = require("./words.js");

const app = express();
app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

let word = words[Math.floor(Math.random() * words.length)];

const wordsByRoom = {};


io.on("connection", (sock) => {

  console.log("Client connected");


    const roomId = "axbr4";


  if (io.sockets.adapter.rooms.size === 0 || io.sockets.adapter.rooms.values().next().value.size === 1) {
    sock.join(roomId);
    console.log(`Client joined room ${roomId}`);
    sock.emit("msg", `You joined room ${roomId}`);

    if (io.sockets.adapter.rooms.get(roomId).size === 2) {
      io.to(roomId).emit("msg", "The game is starting...");
      if (!wordsByRoom[roomId]) {
        wordsByRoom[roomId] = words[Math.floor(Math.random() * words.length)];
      }
      io.to(roomId).emit("word", wordsByRoom[roomId], words);
    }

  } else {
    sock.emit("msg", "Sorry, the room is full. Try again later.");
    sock.disconnect(true);
    console.log("Client refused connection: room is full");
  }

  sock.on("currentWordArr", (currentWordArr) => {
    sock.broadcast.to(roomId).emit("currentWordArr", currentWordArr);
  });

  sock.on("correct", (count) => {
    sock.broadcast.to(roomId).emit("correct", count);
  });

  sock.on("loser", (word) => {
    sock.broadcast.to(roomId).emit("loser",word);
  });

  sock.on("winner", () => {
    io.to(roomId).emit("reload-page");
    wordsByRoom[roomId] = words[Math.floor(Math.random() * words.length)];
    console.log(wordsByRoom)
    io.to(roomId).emit("word", wordsByRoom[roomId], words);
  });

  sock.on("disconnect", () => {
    console.log("Client disconnected");
    if (io.sockets.adapter.rooms.size > 0) {
      const rooms = io.sockets.adapter.rooms;
      rooms.forEach((room, roomId) => {
        if (room.has(sock.id)) {
          io.to(roomId).emit("msg", "One of the players has left the game.");
          console.log(`Client left room ${roomId}`);
        }
      });
    }
  });
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(8080);