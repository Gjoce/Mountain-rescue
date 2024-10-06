// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./config/db'); // Import the database connection

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const injuriesRoutes = require('./api/injuries')(db); // Pass db connection to routes
const rescuersRoutes = require('./api/rescuers')(db);
const authRoutes = require('./api/auth')(db);

// Use routes
app.use('/api/injuries', injuriesRoutes);
app.use('/api/rescuers', rescuersRoutes);
app.use('/api/auth', authRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
