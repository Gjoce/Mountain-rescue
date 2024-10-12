const express = require('express');
const cors = require('cors');
const path = require('path');
const loginRouter = require('./api/login').router; // Import the router
const injuriesRouter = require('./api/injuries'); // Import the injuries router
const registerRouter = require('./api/register'); // Import the registration routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../frontend')));

app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// Use the injury-related routes (protected with verifyFirebaseToken)
app.use('/api/injuries', injuriesRouter); // Mount the injuries router here
app.use('/api', registerRouter); // Mount the registration router here

// Login route
app.use('/api', loginRouter); // Mount the login router here

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
