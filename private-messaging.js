const mongoose = require('mongoose');
const User = mongoose.model('User', {
  username: String,
});

const Message = mongoose.model('Message', {
  from: String,
  to: String,
  content: String,
});

// Send a private message to a user
const sendMessage = async (from, to, content) => {
  const message = new Message({
    from,
    to,
    content,
  });

  await message.save();

  // Update the user's message count
  await User.findByIdAndUpdate(to, { $inc: { messageCount: 1 } });
};

// Get private messages for a user
const getMessages = async (username) => {
  const user = await User.findOne({ username });
  const messages = await Message.find({ to: user._id });
  return messages;
};