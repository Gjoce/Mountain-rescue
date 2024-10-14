// Load environment variables from .env file
require('dotenv').config();

const admin = require('firebase-admin');

// Load the service account key from the environment variable
const serviceAccount = require(process.env.FIREBASE_CONFIG_FILE);

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'mountain-rescue-863ea.appspot.com'
    });
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error; // Rethrow the error or handle it appropriately
}

const db = admin.firestore();
module.exports = db;
