// api/auth.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Login rescuer
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        const sql = 'SELECT * FROM rescuers WHERE email = ? AND password = ?';
        db.query(sql, [email, password], (error, results) => {
            if (error || results.length === 0) {
                return res.status(401).send('Invalid credentials');
            }
            res.status(200).json(results[0]); // Return user details (omit password in real applications)
        });
    });

    // Add more authentication-related endpoints here...

    return router; // Return the router
};
