// login.js
const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const verifyFirebaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

   

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
       

        // Set user details in request object
        req.user = decodedToken;

        // Check for custom claims like admin
        req.user.isAdmin = decodedToken.admin || false;

        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// API route for login
router.post('/login', verifyFirebaseToken, async (req, res) => {
    try {
        const user = req.user;

        // Generate a custom token if needed
        const customToken = await admin.auth().createCustomToken(user.uid);

        // Send response with admin status and token
        res.json({
            token: customToken,
            isAdmin: user.isAdmin,
            email: user.email // Optionally send the user's email
        });
    } catch (error) {
        console.error('Error in login endpoint:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = {
    router, // Export the router
    verifyFirebaseToken // Export the middleware
};
