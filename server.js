const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize express and the server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (your HTML, CSS, JS)
app.use(express.static('public')); // Make sure your 'public' folder contains the HTML file

// Store all connected users
let users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for the "join" event to add the user
  socket.on('join', (username) => {
    // Store the username associated with the socket ID
    users[socket.id] = username;
    console.log(`${username} has joined the chat`);

    // Send a welcome message to the user
    socket.emit('message', `Welcome, ${username}!`);

    // Notify all clients that a new user has joined
    io.emit('message', `${username} has joined the chat.`);
  });

  // Listen for the "message" event from clients
  socket.on('message', (data) => {
    const { from, content } = data;
    console.log(`${from}: ${content}`);

    // Broadcast the message to all clients
    io.emit('message', `${from}: ${content}`);
  });

  // Handle when a user disconnects
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} disconnected`);
      io.emit('message', `${username} has left the chat.`);
    }
    delete users[socket.id];
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
