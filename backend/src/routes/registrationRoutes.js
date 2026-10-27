const express = require('express');
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  updateAttendanceStatus,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/my-registrations', protect, getMyRegistrations);
router.post('/:eventId', protect, registerForEvent);
router.post('/:eventId/cancel', protect, cancelRegistration);
router.get(
  '/event/:eventId',
  protect,
  authorizeRoles('coordinator', 'admin'),
  getEventRegistrations
);
router.patch(
  '/:registrationId/attendance',
  protect,
  authorizeRoles('coordinator', 'admin'),
  updateAttendanceStatus
);

module.exports = router;
