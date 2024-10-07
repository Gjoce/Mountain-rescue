const InjuriesController = require('../controllers/injuriesController');
const express = require('express');
const router = express.Router(); // Ensure this line is present

module.exports = (db) => {
    const controller = new InjuriesController(db); // Pass db connection to the controller

    // Get all injuries
    router.get('/', async (req, res) => {
        try {
            await controller.getAllInjuries(req, res, db); // Pass req, res, and db to controller
        } catch (error) {
            console.error('Error fetching injuries:', error); // Log error for debugging
            res.status(500).json({ message: 'Error fetching injuries', error });
        }
    });

    // Register a new injury
    router.post('/', async (req, res) => {
        try {
            await controller.registerInjury(req, res, db); // Pass req, res, and db to controller
        } catch (error) {
            console.error('Error registering injury:', error); // Log error for debugging
            res.status(500).json({ message: 'Error registering injury', error });
        }
    });

    return router; // Return the router at the end
};
