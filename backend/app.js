const express = require('express');
const cors = require('cors'); // Import cors middleware
const injuryController = require('./controllers/injuriesController');
const loginRouter = require('./api/login');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // To parse JSON bodies

// Enable CORS for all origins (you can restrict it to certain origins if needed)
app.use(cors());

// Injury-related routes
app.get('/api/injuries', injuryController.getAllInjuries); // Get all injuries
app.post('/api/injuries', injuryController.insertInjury); // Insert a new injury
app.get('/api/injuries/rescuer/:rescuer_id', injuryController.getInjuriesByRescuer); // Get injuries by rescuer ID

// Login route
app.use('/api', loginRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
