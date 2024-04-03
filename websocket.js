const WebSocket = require('ws');

const clients = new Set();
const notificationSent = new Set()
// Handle WebSocket connections
const handleWebSocketConnections = (server) => {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws) => {
    // Add the client to the set
    clients.add(ws);

    // Handle incoming messages from clients (if needed)
    ws.on('message', (message) => {
      // Handle client messages here
    });

    // Handle client disconnections
    ws.on('close', () => {
      clients.delete(ws);
    });

    // Send a notification to this client when they connect
    if (!notificationSent.has(ws)) {
      ws.send('Welcome! You are connected to the Ambicam VMS.');
      // sendNotification('Settings Issue are fixed', ws);
      // sendNotification('New version Of Ambicam VMS is available. Please update your app from playstore and appstore', ws);
      notificationSent.add(ws); // Mark the notification as sent
    }
  });

  // Integrate WebSocket server with the HTTP server
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
};

// Use this function to send notifications from your routes or application logic
const sendNotification = (notification) => {
  const notificationData = JSON.stringify(notification);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(notificationData);
    }
  });
};

module.exports = { handleWebSocketConnections, sendNotification };
