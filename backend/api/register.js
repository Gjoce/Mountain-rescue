const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const { verifyFirebaseToken } = require('./login'); // Correctly import the middleware

const verifyAdmin = (req, res, next) => {
    if (!req.user.admin) {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

// Register new rescuer
router.post('/register', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const { email, password, name, isAdmin } = req.body;

        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Store additional user data in Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            name,
            email,
            role: isAdmin ? 'admin' : 'rescuer', // Set role based on isAdmin checkbox
        });

        // Set custom claims for the new user
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: isAdmin });

        res.status(201).json({ message: 'Rescuer registered successfully', uid: userRecord.uid });
    } catch (error) {
        console.error('Error registering rescuer:', error);
        res.status(500).json({ message: 'Error registering rescuer', error: error.message });
    }
});

module.exports = router;
