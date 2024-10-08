const db = require('../config/firebase');
const admin = require('firebase-admin'); // Import Firestore instance

// Get all injuries for admin
exports.getAllInjuries = async (req, res) => {
  try {
    const injuriesSnapshot = await db.collection('injuries').get();
    let injuries = [];
    injuriesSnapshot.forEach((doc) => {
      injuries.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(injuries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching injuries', error });
  }
};

// Insert a new injury
exports.insertInjury = async (req, res) => {
  try {
    // Get the uid from the authenticated user (req.user)
    const uid = req.user.uid; // Assuming you have stored the decoded user info in req.user

    // Destructure other fields from the request body
    const { ski_run, injury_points, medical_comment, rescuer_signature, name, birth_date, ski_card_photo } = req.body;

    // Debugging: Log the uid received
    console.log(`Received uid: ${uid}`);

    // Optionally, you can still fetch the rescuer's name if needed
    const rescuer_name = req.user.name || 'Unknown Rescuer'; // If you store the name in req.user during token verification

    // Add injury document to Firestore
    const newInjury = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      uid,
      rescuer_name,
      ski_run,
      name,
      birth_date,
      ski_card_photo,
      injury_points,
      medical_comment,
      rescuer_signature,
    };

    await db.collection('injuries').add(newInjury);
    res.status(201).json({ message: 'Injury recorded successfully' });

  } catch (error) {
    console.error('Error recording injury:', error); // Log the error
    res.status(500).json({ message: 'Error recording injury', error: error.message }); // Send the error message
  }
};




// Get specific injuries submitted by a rescuer
exports.getInjuriesByRescuer = async (req, res) => {
  try {
    const uid = req.params.uid; // Rescuer's ID from the route params
    const injuriesSnapshot = await db.collection('injuries').where('uid', '==', uid).get();

    let injuries = [];
    injuriesSnapshot.forEach((doc) => {
      injuries.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(injuries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching injuries for rescuer', error });
  }
};
