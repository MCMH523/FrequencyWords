const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const Sentiment = require('sentiment');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const sentiment = new Sentiment();
let connectedCount = 0;
const stats = { totalMessages: 0, totalScore: 0 };

io.on('connection', (socket) => {
  connectedCount++;
  io.emit('user-count', connectedCount);

  socket.on('join', (nickname) => {
    socket.nickname = nickname || 'anonymous';
  });

  socket.on('chat-message', (msg) => {
    const result = sentiment.analyze(msg);
    stats.totalMessages++;
    stats.totalScore += result.score;

    io.emit('chat-message', {
      nickname: socket.nickname,
      text: msg,
      score: result.score
    });
    io.emit('stats', {
      users: connectedCount,
      totalMessages: stats.totalMessages,
      averageScore: stats.totalMessages ? (stats.totalScore / stats.totalMessages) : 0
    });
  });

  socket.on('disconnect', () => {
    connectedCount--;
    io.emit('user-count', connectedCount);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
