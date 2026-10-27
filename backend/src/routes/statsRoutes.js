const express = require('express');
const { getAdminStats, getCoordinatorStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/admin', authorizeRoles('admin'), getAdminStats);
router.get('/coordinator', authorizeRoles('coordinator', 'admin'), getCoordinatorStats);

module.exports = router;
