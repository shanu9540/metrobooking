const express = require('express');
const router = express.Router();
const { getDashboardStats, manageUsers, addStation, editStation, updateFares } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(isAdmin); // Protect all routes below with admin checks

router.get('/dashboard', getDashboardStats);
router.get('/users', manageUsers);
router.post('/stations', addStation);
router.put('/stations/:id', editStation);
router.post('/fares', updateFares);

module.exports = router;
