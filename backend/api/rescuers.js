// api/rescuers.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Register a new rescuer (Admin Only)
    router.post('/register', (req, res) => {
        const { name, surname, email, password, role } = req.body;
        const sql = 'INSERT INTO rescuers (name, surname, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [name, surname, email, password, role], (error, results) => {
            if (error) {
                return res.status(500).send('Error registering rescuer');
            }
            res.status(201).send('Rescuer registered successfully');
        });
    });

    // Add more rescuer-related endpoints here...

    return router; // Return the router
};
