// src/routes/clockRoutes.js
const express = require('express');
const router = express.Router();
const clockController = require('../controllers/clockController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware
const { query } = require('express-validator'); // Importa 'query' para validar query parameters

// Rotas protegidas por autenticação
router.post('/in', authMiddleware, clockController.clockIn);
router.post('/out', authMiddleware, clockController.clockOut);

// Rota para obter relatório de ponto de um usuário específico (GET /api/clock/report/:userId)
// Agora aceita query parameters startDate e endDate para filtragem
router.get(
    '/report/:userId',
    authMiddleware,
    [
        query('startDate')
            .optional()
            .isISO8601()
            .toDate()
            .withMessage('A data de início deve ser uma data válida no formato YYYY-MM-DD.'),
        query('endDate')
            .optional()
            .isISO8601()
            .toDate()
            .withMessage('A data de fim deve ser uma data válida no formato YYYY-MM-DD.'),
        query('endDate')
            .optional()
            .custom((value, { req }) => {
                if (req.query.startDate && value < req.query.startDate) {
                    throw new Error('A data de fim não pode ser anterior à data de início.');
                }
                return true;
            })
    ],
    clockController.getClockReport
);

// Rota para obter o salário mensal (GET /api/clock/salary/:userId)
router.get('/salary/:userId', authMiddleware, clockController.getMonthlySalary);

module.exports = router;
