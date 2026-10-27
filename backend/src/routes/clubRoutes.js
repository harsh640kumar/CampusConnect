const express = require('express');
const { body } = require('express-validator');
const {
  getClubs,
  getClubByIdOrSlug,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  getMyCoordinatedClubs,
} = require('../controllers/clubController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

const clubValidation = [
  body('name').trim().notEmpty().withMessage('Club name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn([
      'Technical',
      'Cultural',
      'Sports',
      'Literary',
      'Social & Outreach',
      'Entrepreneurship',
      'Arts & Media',
    ])
    .withMessage('Valid club category is required'),
  validate,
];

router.get('/', optionalAuth, getClubs);
router.get('/my/coordinated', protect, authorizeRoles('coordinator', 'admin'), getMyCoordinatedClubs);
router.get('/:idOrSlug', optionalAuth, getClubByIdOrSlug);
router.post('/', protect, authorizeRoles('coordinator', 'admin'), clubValidation, createClub);
router.put('/:id', protect, authorizeRoles('coordinator', 'admin'), updateClub);
router.delete('/:id', protect, authorizeRoles('admin'), deleteClub);
router.post('/:id/join', protect, joinClub);
router.post('/:id/leave', protect, leaveClub);

module.exports = router;
