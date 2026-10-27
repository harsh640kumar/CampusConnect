const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root Service Status & Information
app.get('/', (req, res) => {
  res.json({
    name: 'CampusConnect API Server',
    version: '1.0.0',
    status: 'online',
    message: 'Welcome to the CampusConnect College Event and Club Management API',
    endpoints: {
      healthCheck: '/api/health',
      auth: '/api/auth',
      events: '/api/events',
      clubs: '/api/clubs',
      registrations: '/api/registrations',
      notifications: '/api/notifications',
      stats: '/api/stats',
      users: '/api/users',
    },
  });
});

// API Routes
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
