const InjuryModel = require('../models/injuryModel');

class InjuriesController {
    constructor() {}

    async getAllInjuries(req, res, db) {
        try {
            const injuries = await InjuryModel.getAll(db); // Fetch all injuries
            res.json(injuries);
        } catch (err) {
            console.error('Error fetching injuries:', err);
            res.status(500).json({ message: 'Database query failed', error: err });
        }
    }

    async registerInjury(req, res, db) {
        try {
            const injuryData = req.body; // Get data from request body
            console.log('Injury Data:', injuryData); // Log incoming data for debugging
            await InjuryModel.register(injuryData, db); // Register the injury using the model
            res.status(201).json({ message: 'Injury registered successfully' });
        } catch (error) {
            console.error('Error registering injury:', error);
            res.status(500).json({ message: 'Error registering injury', error });
        }
    }
}

module.exports = InjuriesController;
