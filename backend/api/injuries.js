const express = require('express');
const router = express.Router();
const injuriesController = require('../controllers/injuriesController');
const { verifyFirebaseToken } = require('./login'); // Correctly import the middleware

// Protect all routes under this router with verifyFirebaseToken
router.use(verifyFirebaseToken);

// Admin verification middleware
const verifyAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Get all injuries (admin)
router.get('/admin', verifyAdmin, injuriesController.getAllInjuries);


// Insert a new injury
router.post('/', injuriesController.insertInjury);

// Get specific injuries submitted by a rescuer
router.get('/:uid', injuriesController.getInjuriesByRescuer);

module.exports = router;
