const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getFeaturedEvents,
  getEventByIdOrSlug,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyCoordinatedEvents,
} = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('clubId').notEmpty().withMessage('Club ID is required'),
  body('category')
    .isIn([
      'Workshop',
      'Hackathon',
      'Seminar',
      'Cultural',
      'Sports',
      'Networking',
      'Competition',
      'General',
    ])
    .withMessage('Valid event category is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('date').isISO8601().toDate().withMessage('Valid event date is required'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer of at least 1'),
  body('registrationDeadline')
    .isISO8601()
    .toDate()
    .withMessage('Valid registration deadline is required'),
  validate,
];

router.get('/', optionalAuth, getEvents);
router.get('/featured', getFeaturedEvents);
router.get(
  '/coordinator/my-events',
  protect,
  authorizeRoles('coordinator', 'admin'),
  getMyCoordinatedEvents
);
router.get('/:idOrSlug', optionalAuth, getEventByIdOrSlug);
router.post(
  '/',
  protect,
  authorizeRoles('coordinator', 'admin'),
  eventValidation,
  createEvent
);
router.put('/:id', protect, authorizeRoles('coordinator', 'admin'), updateEvent);
router.delete('/:id', protect, authorizeRoles('coordinator', 'admin'), deleteEvent);

module.exports = router;
