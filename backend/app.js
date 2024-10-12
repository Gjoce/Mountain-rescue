const express = require('express');
const cors = require('cors');
const path = require('path');
const loginRouter = require('./api/login').router; // Import the router
const injuriesRouter = require('./api/injuries');
const registerRouter  = require('./api/register'); // Import the injury routes
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, '../frontend')));

app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// Use the injury-related routes (protected with verifyFirebaseToken)
app.use('/api/injuries', injuriesRouter);
app.use('/api', registerRouter);

// Login route
app.use('/api', loginRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
