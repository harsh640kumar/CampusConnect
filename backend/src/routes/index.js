const express = require('express');
const authRoutes = require('./authRoutes');
const clubRoutes = require('./clubRoutes');
const eventRoutes = require('./eventRoutes');
const registrationRoutes = require('./registrationRoutes');
const notificationRoutes = require('./notificationRoutes');
const userRoutes = require('./userRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/clubs', clubRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusConnect API',
  });
});

module.exports = router;
