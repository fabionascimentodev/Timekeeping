// src/routes/clockRoutes.js
const express = require('express');
const router = express.Router();
const clockController = require('../controllers/clockController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware
const { body, query } = require('express-validator'); // Importa 'body' e 'query' para validação

// Rotas protegidas por autenticação

// Rota para registrar entrada de ponto (POST /api/clock/in)
router.post(
    '/in',
    authMiddleware,
    [
        // Validação para latitude e longitude (opcionais, mas se existirem, devem ser numéricos)
        body('latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude deve ser um número entre -90 e 90.'),
        body('longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude deve ser um número entre -180 e 180.')
    ],
    clockController.clockIn
);

// Rota para registrar saída de ponto (POST /api/clock/out)
router.post(
    '/out',
    authMiddleware,
    [
        // Validação para latitude e longitude (opcionais, mas se existirem, devem ser numéricos)
        body('latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude deve ser um número entre -90 e 90.'),
        body('longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude deve ser um número entre -180 e 180.')
    ],
    clockController.clockOut
);

// Rota para obter relatório de ponto de um usuário específico (GET /api/clock/report/:userId)
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
