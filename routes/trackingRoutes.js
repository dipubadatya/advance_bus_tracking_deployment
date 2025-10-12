
// routes/trackingRoutes.js
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.get('/', trackingController.getHomePage);
router.get('/track/:busId', trackingController.getTrackingPage); 
router.post('/api/nearest-stop', trackingController.findNearestStop); 
router.get('/bus-list',trackingController.allBus)

module.exports = router; 