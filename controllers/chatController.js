import jwt from 'jsonwebtoken';
import pool from '../dbconfig.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dentalclinic_jwt_secret_key_2026';

// ── Socket.io setup ──────────────────────────────────────────────────────────

export const setupSocketIO = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (ID: ${socket.userId}, Role: ${socket.userRole})`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        if (!conversationId || !content || !content.trim()) return;

        const [convRows] = await pool.execute(
          'SELECT id, patient_id, status FROM conversations WHERE id = ?',
          [conversationId]
        );
        if (!convRows.length) return;

        const conv = convRows[0];
        if (conv.status === 'closed') {
          socket.emit('error_message', { message: 'This conversation has been closed.' });
          return;
        }

        const [result] = await pool.execute(
          'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
          [conversationId, socket.userId, content.trim()]
        );

        const [newMessage] = await pool.execute(
          `SELECT m.*, u.name AS sender_name, u.role AS sender_role
           FROM messages m JOIN users u ON m.sender_id = u.id
           WHERE m.id = ?`,
          [result.insertId]
        );

        await pool.execute(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );

        io.to(`conv_${conversationId}`).emit('receive_message', newMessage[0]);

        if (socket.userRole === 'patient') {
          io.to('admins').emit('conversation_updated', {
            conversationId,
            patient_id: conv.patient_id,
            lastMessage: content.trim(),
            sender_name: socket.userName,
            updated_at: new Date().toISOString(),
          });
        } else {
          io.to(`patient_${conv.patient_id}`).emit('conversation_updated', {
            conversationId,
            lastMessage: content.trim(),
            sender_name: socket.userName,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('error_message', { message: 'Failed to send message.' });
      }
    });

    socket.on('typing', (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.to(room).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        conversationId,
      });
    });

    socket.on('stop_typing', (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.to(room).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    if (socket.userRole === 'admin' || socket.userRole === 'super_admin') {
      socket.join('admins');
    }

    if (socket.userRole === 'patient') {
      socket.join(`patient_${socket.userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName}`);
    });
  });
};

// ── REST Endpoints ───────────────────────────────────────────────────────────

export const getOrCreateConversation = async (req, res) => {
  try {
    const patientId = req.user.id;

    const [existing] = await pool.execute(
      "SELECT id, patient_id, subject, status, created_at, updated_at FROM conversations WHERE patient_id = ? AND status = 'open' ORDER BY created_at DESC LIMIT 1",
      [patientId]
    );

    if (existing.length) {
      return res.json({ status: 'success', conversation: existing[0] });
    }

    const [result] = await pool.execute(
      "INSERT INTO conversations (patient_id, subject, status) VALUES (?, 'Support Request', 'open')",
      [patientId]
    );

    const [newConv] = await pool.execute(
      'SELECT id, patient_id, subject, status, created_at, updated_at FROM conversations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ status: 'success', conversation: newConv[0] });
  } catch (err) {
    console.error('Error getting/creating conversation:', err);
    res.status(500).json({ status: 'error', message: 'Error with conversation.' });
  }
};

export const getPatientConversations = async (req, res) => {
  try {
    const patientId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT c.*,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) AS unread_count
       FROM conversations c WHERE c.patient_id = ? ORDER BY c.updated_at DESC`,
      [patientId, patientId]
    );
    res.json({ status: 'success', conversations: rows });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ status: 'error', message: 'Error fetching conversations.' });
  }
};

export const getAllConversations = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, u.name AS patient_name, u.email AS patient_email,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT u2.name FROM messages m2 JOIN users u2 ON m2.sender_id = u2.id WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_sender_name,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id = c.patient_id AND is_read = FALSE) AS unread_count
       FROM conversations c JOIN users u ON c.patient_id = u.id
       ORDER BY c.status = 'open' DESC, c.updated_at DESC`
    );
    res.json({ status: 'success', conversations: rows });
  } catch (err) {
    console.error('Error fetching all conversations:', err);
    res.status(500).json({ status: 'error', message: 'Error fetching conversations.' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [convRows] = await pool.execute(
      'SELECT id, patient_id, status FROM conversations WHERE id = ?',
      [id]
    );

    if (!convRows.length) {
      return res.status(404).json({ status: 'error', message: 'Conversation not found.' });
    }

    const conv = convRows[0];
    if (userRole === 'patient' && conv.patient_id !== userId) {
      return res.status(403).json({ status: 'error', message: 'Access denied.' });
    }

    const [rows] = await pool.execute(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );

    res.json({ status: 'success', messages: rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ status: 'error', message: 'Error fetching messages.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { conversation_id } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!conversation_id) {
      return res.status(400).json({ status: 'error', message: 'conversation_id is required.' });
    }

    if (userRole === 'patient') {
      await pool.execute(
        'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
        [conversation_id, userId]
      );
    } else {
      await pool.execute(
        'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
        [conversation_id, userId]
      );
    }

    res.json({ status: 'success', message: 'Messages marked as read.' });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ status: 'error', message: 'Error updating messages.' });
  }
};

export const closeConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("UPDATE conversations SET status = 'closed' WHERE id = ?", [id]);
    res.json({ status: 'success', message: 'Conversation closed.' });
  } catch (err) {
    console.error('Error closing conversation:', err);
    res.status(500).json({ status: 'error', message: 'Error closing conversation.' });
  }
};

export const reopenConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("UPDATE conversations SET status = 'open' WHERE id = ?", [id]);
    res.json({ status: 'success', message: 'Conversation reopened.' });
  } catch (err) {
    console.error('Error reopening conversation:', err);
    res.status(500).json({ status: 'error', message: 'Error reopening conversation.' });
  }
};
