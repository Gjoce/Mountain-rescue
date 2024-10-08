// routes/injuryRoutes.js
const express = require('express');
const injuryController = require('../controllers/injuriesController');

const router = express.Router();

// Route to get all injuries (admin view)
router.get('/injuries', injuryController.getAllInjuries);

// Route to get injuries by rescuer ID
router.get('/injuries/rescuer/:rescuer_id', injuryController.getInjuriesByRescuer);

// Route to insert a new injury
router.post('/injuries', injuryController.insertInjury);

module.exports = router;
