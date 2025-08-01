// src/routes/clockRoutes.js
const express = require('express');
const router = express.Router();
const clockController = require('../controllers/clockController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware

// Rotas protegidas por autenticação
router.post('/in', authMiddleware, clockController.clockIn);
router.post('/out', authMiddleware, clockController.clockOut);
router.get('/report/:userId', authMiddleware, clockController.getClockReport);

// Rota para obter o salário mensal (GET /api/clock/salary/:userId)
router.get('/salary/:userId', authMiddleware, clockController.getMonthlySalary);

module.exports = router;
