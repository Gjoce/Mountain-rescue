require("dotenv").config();

const admin = require("firebase-admin");

const serviceAccount = require(process.env.FIREBASE_CONFIG_FILE);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "mountain-rescue-863ea.appspot.com",
  });
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  throw error;
}

const db = admin.firestore();
module.exports = db;
