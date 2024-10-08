const express = require('express');
const injuryController = require('./controllers/injuriesController'); // Adjust the path as needed
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // To parse JSON bodies

// Define your routes
app.get('/api/injuries', injuryController.getAllInjuries); // Get all injuries
app.post('/api/injuries', injuryController.insertInjury); // Insert a new injury
app.get('/api/injuries/rescuer/:rescuer_id', injuryController.getInjuriesByRescuer); // Get injuries by rescuer ID


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
