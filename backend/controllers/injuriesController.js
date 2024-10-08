// controllers/injuryController.js
const injuryModel = require('../models/injuryModel');

// Get all injuries (admin view)
const getAllInjuries = (req, res) => {
  injuryModel.getAllInjuries((err, injuries) => {
    if (err) return res.status(500).send(err);
    res.json(injuries);
  });
};

// Get injuries by rescuer ID
const getInjuriesByRescuer = (req, res) => {
  const rescuer_id = req.params.rescuer_id;

  injuryModel.getInjuriesByRescuer(rescuer_id, (err, injuries) => {
    if (err) return res.status(500).send(err);
    res.json(injuries);
  });
};

// Insert a new injury
const insertInjury = (req, res) => {
    const injuryData = req.body;
  
    // Fetch rescuer name by rescuer_id
    injuryModel.getRescuerNameById(injuryData.rescuer_id, (err, rescuerName) => {
      if (err) return res.status(500).send({ message: err.message });
  
      // Automatically set the rescuer_name from the fetched data
      injuryData.rescuer_name = rescuerName;
  
      // Insert the injury into the database
      injuryModel.insertInjury(injuryData, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Injury inserted successfully', injuryId: result.insertId });
      });
    });
  };

module.exports = {
  getAllInjuries,
  getInjuriesByRescuer,
  insertInjury
};
