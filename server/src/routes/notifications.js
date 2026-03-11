const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Store active connections
// Map of userId -> res object
const clients = new Map();

// GET /api/notifications/stream
// Connect to the SSE stream
router.get('/stream', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Set necessary headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE

  // Add this client to our map
  clients.set(userId, res);
  console.log(`[SSE] Client connected: ${userId}`);

  // Send an initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`[SSE] Client disconnected: ${userId}`);
    clients.delete(userId);
  });
});

// Helper function to send an event to a specific user
const sendNotificationToUser = (userId, data) => {
  const client = clients.get(userId);
  if (client) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  }
  return false;
};

// Export the router and the helper function so admin.js can use it
module.exports = { router, sendNotificationToUser };
