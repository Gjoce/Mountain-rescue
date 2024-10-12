const db = require('../config/firebase');
const admin = require('firebase-admin'); // Firestore instance

// Get all injuries for admin
exports.getAllInjuries = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const injuriesSnapshot = await db.collection('injuries').get();
    let injuries = [];

    injuriesSnapshot.forEach((doc) => {
      injuries.push({ id: doc.id, ...doc.data() });
    });

    console.log('Total injuries:', injuries.length);

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const paginatedInjuries = injuries.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(injuries.length / limit),
      data: paginatedInjuries,
    });
  } catch (error) {
    console.error('Error fetching injuries:', error);
    res.status(500).json({ message: 'Error fetching injuries', error });
  }
};

// Insert a new injury
exports.insertInjury = async (req, res) => {
  try {
    const uid = req.user.uid;

    const { ski_run, injury_points, medical_comment, rescuer_signature, name, birth_date, ski_card_photo } = req.body;

    console.log(`Received uid: ${uid}`);

    const rescuer_name = req.user.name || 'Unknown Rescuer';

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
      status: 'pending' // Default status
    };

    await db.collection('injuries').add(newInjury);
    res.status(201).json({ message: 'Injury recorded successfully' });

  } catch (error) {
    console.error('Error recording injury:', error);
    res.status(500).json({ message: 'Error recording injury', error: error.message });
  }
};

// Get specific injuries by rescuer
exports.getInjuriesByRescuer = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { page = 1, limit = 5 } = req.query;

    const injuriesSnapshot = await db.collection('injuries').where('uid', '==', uid).get();
    let injuries = [];

    injuriesSnapshot.forEach((doc) => {
      injuries.push({ id: doc.id, ...doc.data() });
    });

    console.log('Total injuries:', injuries.length);

    const startIndex = (page - 1) * limit;
    const paginatedInjuries = injuries.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(injuries.length / limit),
      data: paginatedInjuries,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching injuries for rescuer', error });
  }
};

// Approve an injury
exports.approveInjury = async (req, res) => {
  try {
    const injuryId = req.params.id;

    const injuryRef = db.collection('injuries').doc(injuryId);
    const injury = await injuryRef.get();

    if (!injury.exists) {
      return res.status(404).json({ error: 'Injury not found' });
    }

    await injuryRef.update({ status: 'approved' });
    res.status(200).json({ success: true, message: 'Injury approved successfully' });
  } catch (error) {
    console.error('Error approving injury:', error);
    res.status(500).json({ error: 'Unable to approve injury', details: error.message });
  }
};

// Reject an injury
exports.rejectInjury = async (req, res) => {
  try {
    const injuryId = req.params.id;

    const injuryRef = db.collection('injuries').doc(injuryId);
    const injury = await injuryRef.get();

    if (!injury.exists) {
      return res.status(404).json({ error: 'Injury not found' });
    }

    await injuryRef.update({ status: 'rejected' });
    res.status(200).json({ success: true, message: 'Injury rejected successfully' });
  } catch (error) {
    console.error('Error rejecting injury:', error);
    res.status(500).json({ error: 'Unable to reject injury', details: error.message });
  }
};
