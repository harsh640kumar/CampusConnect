const express = require('express');
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getCoordinators,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/coordinators', authorizeRoles('admin', 'coordinator'), getCoordinators);
router.get('/', authorizeRoles('admin'), getAllUsers);
router.patch('/:id/role', authorizeRoles('admin'), updateUserRole);
router.patch('/:id/status', authorizeRoles('admin'), toggleUserStatus);

module.exports = router;
