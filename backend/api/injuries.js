const InjuriesController = require('../controllers/injuriesController');
const express = require('express');
const router = express.Router(); // Ensure this line is present

module.exports = (db) => {
    const controller = new InjuriesController(db); // Pass db connection to the controller

    // Get all injuries
    router.get('/', async (req, res) => {
        try {
            const injuries = await controller.getAllInjuries(); // Call the controller method directly
            res.json(injuries);
        } catch (error) {
            console.error('Error fetching injuries:', error); // Log error for debugging
            res.status(500).json({ message: 'Error fetching injuries', error });
        }
    });

    // Register a new injury
    router.post('/', async (req, res) => {
        try {
            const injuryData = req.body; // Get data from the request body
            await controller.registerInjury(injuryData); // Pass data to the controller method
            res.status(201).json({ message: 'Injury registered successfully' });
        } catch (error) {
            console.error('Error registering injury:', error); // Log error for debugging
            res.status(500).json({ message: 'Error registering injury', error });
        }
    });

    return router; // Return the router at the end
};
