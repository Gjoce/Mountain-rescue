// controllers/injuriesController.js
const InjuryModel = require('../models/injuryModel');

class InjuriesController {
    constructor() {}

    getAllInjuries(req, res, db) {
        const injuryModel = new InjuryModel(db);
        
        injuryModel.getAllInjuries((err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database query failed' });
            }
            res.json(results);
        });
    }

    async registerInjury(req, res, db) {
        try {
            const injuryData = req.body; // Get data from request body
            await InjuryModel.register(injuryData, db); // Register the injury using the model
            res.status(201).json({ message: 'Injury registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error registering injury', error });
        }
    }
    
}

module.exports = InjuriesController;
