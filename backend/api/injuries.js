const express = require('express');
const router = express.Router();
const injuriesController = require('../controllers/injuriesController');

// Get all injuries (admin)
router.get('/admin/injuries', injuriesController.getAllInjuries);

// Insert a new injury
router.post('/injuries', injuriesController.insertInjury);

// Get specific injuries submitted by a rescuer
router.get('/injuries/:rescuer_id', injuriesController.getInjuriesByRescuer);

module.exports = router;
