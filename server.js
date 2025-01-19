const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle a new user joining the chat
  socket.on('join', (username) => {
    users[socket.id] = username;
    console.log(`${username} has joined the chat`);
    socket.emit('message', { from: 'Server', content: `Welcome, ${username}!`, time: getCurrentTime() });
    io.emit('message', { from: 'Server', content: `${username} has joined the chat.`, time: getCurrentTime() });
  });

  // Handle incoming messages
  socket.on('message', (data) => {
    const { from, content } = data;
    console.log(`${from}: ${content}`);
    io.emit('message', { from, content, time: getCurrentTime() });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} disconnected`);
      io.emit('message', { from: 'Server', content: `${username} has left the chat.`, time: getCurrentTime() });
    }
    delete users[socket.id];
  });
});

// Helper function to get the current time in a formatted manner
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
