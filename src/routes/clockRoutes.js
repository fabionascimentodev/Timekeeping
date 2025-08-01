// src/routes/clockRoutes.js
const express = require('express');
const router = express.Router();
const clockController = require('../controllers/clockController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas protegidas por autenticação
router.post('/', authMiddleware, clockController.clockIn);
router.get('/report/:id', authMiddleware, clockController.getClockReport);
router.get('/salary/:id', authMiddleware, clockController.getMonthlySalary);

module.exports = router;