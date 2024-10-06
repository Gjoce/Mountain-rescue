// api/injuries.js
const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Setup file storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({ storage });

module.exports = (db) => {
    // Register a new injury
    router.post('/register', upload.single('ski_card_photo'), (req, res) => {
        const { timestamp, rescuer_id, ski_run, patient_name, patient_surname, birth_date, injury_points, medical_comment } = req.body;
        const ski_card_photo = req.file ? `/uploads/${req.file.filename}` : null; // Get the file path
        const sql = 'INSERT INTO injuries (timestamp, rescuer_id, ski_run, patient_name, patient_surname, birth_date, ski_card_photo, injury_points, medical_comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
        db.query(sql, [timestamp, rescuer_id, ski_run, patient_name, patient_surname, birth_date, ski_card_photo, injury_points, medical_comment], (error, results) => {
            if (error) {
                return res.status(500).send('Error registering injury');
            }
            res.status(201).send('Injury registered successfully');
        });
    });

    // Add more injury-related endpoints here...

    return router; // Return the router
};
