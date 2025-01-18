const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Set up middleware to serve static files from the 'public' directory
app.use(express.static('public'));

// Establish a real-time connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send a message to the client when it connects
  socket.emit('welcome', 'Welcome to the real-time chat app!');

  // Handle message sent by the client
  socket.on('message', (message) => {
    console.log('Client sent message:', message);
    // Broadcast the message to all connected clients
    io.emit('message', message);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Set up a port to listen for incoming connections
const port = 3000;

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});