// server.js
const express = require('express');
const injuryRoutes = require('./api/injuries');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', injuryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
