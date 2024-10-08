const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Store the decoded user info in the request object
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
    
    // Here you can create your custom session or return some other token if needed.
    // For example, we can generate a custom token for further use:
    const customToken = await admin.auth().createCustomToken(user.uid);

    // Send custom token as response
    res.json({ token: customToken });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
