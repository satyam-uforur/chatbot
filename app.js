const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = {}; // Track connected users
let messages = loadMessagesFromFile(); // Load chat history from file (if available)

// Handle new user connections
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle user joining the chat
  socket.on('join', (username) => {
    users[socket.id] = username;
    console.log(`${username} has joined the chat`);

    // Send chat history to the newly joined user
    socket.emit('chatHistory', messages);

    // Welcome message to the user
    socket.emit('message', { from: 'Server', content: `Welcome, ${username}!`, time: getCurrentTime() });

    // Notify all users about the new join
    io.emit('message', { from: 'Server', content: `${username} has joined the chat.`, time: getCurrentTime() });
  });

  // Handle incoming messages
  socket.on('message', (data) => {
    const { from, content } = data;
    console.log(`${from}: ${content}`);

    // Store the new message in memory (messages array)
    const message = { from, content, time: getCurrentTime() };
    messages.push(message); // Add the new message to history

    // Save chat history to file (for persistence across server restarts)
    saveMessagesToFile(messages);

    // Broadcast the message to all connected clients
    io.emit('message', message);
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} disconnected`);
      io.emit('message', { from: 'Server', content: `${username} has left the chat.`, time: getCurrentTime() });
    }
    delete users[socket.id]; // Remove user from the list of connected users
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

// Function to save messages to a file
function saveMessagesToFile(messages) {
  fs.writeFileSync('chatHistory.json', JSON.stringify(messages)); // Save chat history to a file
}

// Function to load messages from a file
function loadMessagesFromFile() {
  try {
    const data = fs.readFileSync('chatHistory.json', 'utf-8');
    return JSON.parse(data); // Return the parsed messages from the file
  } catch (error) {
    return []; // If the file does not exist or can't be read, return an empty array
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
