const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const words = require("./words.js");

const app = express();
app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

let word = words[Math.floor(Math.random() * words.length)];

app.get("/join-room", (req, res, next) => {
  const code = req.query.code;
  console.log(`Received code ${code} from client.`);
  if (code === 'Code') {
    return next();
  } else {
    return res.sendStatus(403);
  }
}, (req, res) => {
  res.sendStatus(200);
});

io.on("connection", (sock) => {
  console.log("Client connected");

  sock.emit("msg", "you are connected");
  io.emit("word", word, words);
  sock.on('loser', () => {
    // notify all clients except the loser that they lost the round
    sock.broadcast.emit('loser');
  });
  sock.on("winner", () => {
    word = words[Math.floor(Math.random() * words.length)];
    io.emit("reload-page"); 
    io.emit("word", word, words);
  });

  sock.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(8080);