// firebase.js (Firebase Admin initialization)
const admin = require('firebase-admin');
const serviceAccount = require('../keys/mountain-rescue-863ea-firebase-adminsdk-ggb80-84c2cd8832.json'); // Replace with the path to your service account key

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
