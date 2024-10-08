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
// Insert a new injury
exports.insertInjury = async (req, res) => {
  try {
    const { uid, ski_run, injury_points, medical_comment, rescuer_signature, name, birth_date, ski_card_photo } = req.body;

    // Debugging: Log the uid received
    console.log(`Received uid: ${uid}`);

    // Get rescuer's name based on uid
    const rescuerDoc = await db.collection('rescuers').doc(uid).get();

    // Debugging: Log if the rescuer document exists
    console.log(`Rescuer document exists: ${rescuerDoc.exists}`);

    if (!rescuerDoc.exists) {
      return res.status(404).json({ message: 'Rescuer not found' });
    }
    
    const rescuer_name = rescuerDoc.data().name;

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
    const rescuer_id = req.params.rescuer_id; // Rescuer's ID from the route params
    const injuriesSnapshot = await db.collection('injuries').where('rescuer_id', '==', rescuer_id).get();

    let injuries = [];
    injuriesSnapshot.forEach((doc) => {
      injuries.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(injuries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching injuries for rescuer', error });
  }
};
