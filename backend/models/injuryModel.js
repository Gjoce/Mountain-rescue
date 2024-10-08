// models/injuryModel.js
const db = require('../config/db');

// Get all injuries (for admin)
const getAllInjuries = (callback) => {
  const query = 'SELECT * FROM injuries';
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Get injuries for a specific rescuer
const getInjuriesByRescuer = (rescuer_id, callback) => {
  const query = 'SELECT * FROM injuries WHERE rescuer_id = ?';
  db.query(query, [rescuer_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Insert a new injury
const insertInjury = (injuryData, callback) => {
  const query = `INSERT INTO injuries 
    (rescuer_id, injury_points, medical_comment, rescuer_signature, name, birth_date, ski_card_photo, ski_run, rescuer_name) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    injuryData.rescuer_id,
    JSON.stringify(injuryData.injury_points),
    injuryData.medical_comment,
    injuryData.rescuer_signature,
    injuryData.name,
    injuryData.birth_date,
    injuryData.ski_card_photo,
    injuryData.ski_run,
    injuryData.rescuer_name
  ];

  db.query(query, values, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const getRescuerNameById = (rescuer_id, callback) => {
    const query = 'SELECT name FROM rescuers WHERE id = ?'; 
    db.query(query, [rescuer_id], (err, result) => {
      if (err) return callback(err);
      if (result.length > 0) {
        callback(null, result[0].name);
      } else {
        callback(new Error('Rescuer not found'));
      }
    });
  };

module.exports = {
  getAllInjuries,
  getInjuriesByRescuer,
  insertInjury,
  getRescuerNameById
};
