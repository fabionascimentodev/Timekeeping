// src/routes/clockRoutes.js
const express = require('express');
const router = express.Router();
const clockController = require('../controllers/clockController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware

// Rotas protegidas por autenticação
// Rota para registrar entrada de ponto (POST /api/clock/in)
router.post('/in', authMiddleware, clockController.clockIn);

// Rota para registrar saída de ponto (POST /api/clock/out)
router.post('/out', authMiddleware, clockController.clockOut);

// Rota para obter relatório de ponto de um usuário específico (GET /api/clock/report/:userId)
router.get('/report/:userId', authMiddleware, clockController.getClockReport);

// Rota para obter o salário mensal (GET /api/clock/salary/:userId)
router.get('/salary/:userId', authMiddleware, clockController.getMonthlySalary);

module.exports = router;
