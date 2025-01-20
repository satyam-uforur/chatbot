const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/message'); // Import the message model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB URI (replace with your MongoDB connection string)
const MONGO_URI = 'mongodb+srv://st290130:Nrs%40tyam12345@cluster0.fa9rdny.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Serve static files
app.use(express.static('public'));

// WebSocket logic
let users = {}; // Track connected users

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle user joining the chat
  socket.on('join', async (username) => {
    users[socket.id] = username;
    console.log(`${username} has joined the chat`);

    // Send chat history to the newly joined user (up to the latest message in server)
    try {
      const messages = await Message.find(); // Fetch all messages from MongoDB
      socket.emit('chatHistory', messages); // Send chat history to client
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }

    // Send welcome message
    socket.emit('message', { from: 'Server', content: `Welcome, ${username}!`, time: getCurrentTime() });

    // Notify all users about the new join
    io.emit('message', { from: 'Server', content: `${username} has joined the chat.`, time: getCurrentTime() });
  });

  // Handle incoming messages
  socket.on('message', async (data) => {
    const { from, content } = data;
    console.log(`${from}: ${content}`);

    const message = new Message({ from, content, time: getCurrentTime() });

    try {
      // Save the new message to MongoDB
      await message.save();
      console.log('Message saved to MongoDB');
    } catch (err) {
      console.error('Error saving message:', err);
    }

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

// Helper function to get the current time
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
