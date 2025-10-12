// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware'); 

router.get('/', isAuthenticated, dashboardController.getDashboard);
router.get('/bus/edit', isAuthenticated, dashboardController.getEditBus);
router.post('/bus/edit', isAuthenticated, dashboardController.postEditBus);

module.exports = router;