const express = require('express');
const cors = require('cors');
const loginRouter = require('./api/login').router; // Import the router
const injuriesRouter = require('./api/injuries'); // Import the injury routes
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// Use the injury-related routes (protected with verifyFirebaseToken)
app.use('/api/injuries', injuriesRouter);

// Login route
app.use('/api', loginRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
