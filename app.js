const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');
const https = require('https'); // Add the https module
const fs = require('fs'); // Required for reading SSL certificates
const path = require("path");
const { handleWebSocketConnections, sendNotification } = require('./websocket'); // Import WebSocket logic
const app = express();

const { createServer } = require('http');
const isAuthenticated = require('./middleware/authMiddleware');
const errorMiddleware = require("./middleware/error");

const downloadRoutes = require('./routes/downloadRoutes');
const userRoutes = require('./routes/userRoutes');
const settingRoutes = require('./routes/settingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cameraRoutes = require("./routes/cameraRoutes");


// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/config.env" });
}

// Enable CORS for all routes
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Replace with your actual domain and IP
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
// app.use((req, res, next) => {
//   const allowedOrigins = ['https://home.ambicam.com', 'https://adminpanel.ambicam.com'];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });
// Parse JSON request body
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
connectDB();

const port = process.env.PORT || 443;

// Load SSL/TLS certificates
// const privateKey = fs.readFileSync('./privkey.pem', 'utf8');
// const certificate = fs.readFileSync('./fullchain.pem', 'utf8');
// const passphrase = 'ambicam';
// const credentials = { key: privateKey, cert: certificate, passphrase: passphrase };

// // Create an HTTPS server
// const httpsServer = https.createServer(credentials, app);

// Integrate WebSocket logic with the HTTPS server

const server = createServer(app);

handleWebSocketConnections(server);
// Example HSTS header configuration
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});


// Define a route for the root ("/") just for testing
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./Pages/index.html"));
});

// Mount the download routes
app.use('/user', userRoutes);
app.use("/camera", cameraRoutes);
app.use('/feed', downloadRoutes);
app.use('/setting', settingRoutes);
app.use('/admin', adminRoutes);



// Middleware for Errors
app.use(errorMiddleware);

// httpsServer.listen(port, () => {
//   console.log(`Ambicam-App server is running on port ${port}`);
// });
app.listen(port, () => {
  console.log(`Ambicam-App server is running on port ${port}`);
});

// Handling Uncaught Exception
// process.on("uncaughtException", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`);
//   // process.exit(1);
// });

// Unhandled Promise Rejection
// process.on("unhandledRejection", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Unhandled Promise Rejection`);

//   server.close(() => {
//     process.exit(1);
//   });
// });