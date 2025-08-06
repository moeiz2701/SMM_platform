const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    connectedUsers.set(socket.user._id.toString(), socket.id);

    // Join personal room
    socket.join(socket.user._id.toString());

    // Handle private messages
    socket.on('private_message', async (data) => {
      try {
        const { recipientId, content } = data;
        
        // Create conversation ID (sorted to ensure consistency)
        const participants = [socket.user._id.toString(), recipientId].sort();
        const conversationId = participants.join('_');

        // Save message to database
        const message = await Message.create({
          sender: socket.user._id,
          recipient: recipientId,
          content,
          conversationId
        });

        // Populate sender info
        await message.populate('sender', 'name');

        // Emit to recipient if online
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message', message);
        }

        // Emit back to sender
        socket.emit('message_sent', message);
      } catch (error) {
        socket.emit('message_error', error.message);
      }
    });

    // Handle message read status
    socket.on('mark_read', async (messageId) => {
      try {
        await Message.findByIdAndUpdate(messageId, { read: true });
        socket.emit('message_marked_read', messageId);
      } catch (error) {
        socket.emit('message_error', error.message);
      }
    });

    // Handle typing indicators
    socket.on('typing', (recipientId) => {
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', socket.user._id);
      }
    });

    socket.on('stop_typing', (recipientId) => {
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stop_typing', socket.user._id);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      connectedUsers.delete(socket.user._id.toString());
    });
  });

  return io;
};

module.exports = setupSocket;
