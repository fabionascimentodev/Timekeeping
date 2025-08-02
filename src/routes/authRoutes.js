// src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController'); // Importa o controlador

const router = express.Router();

// Rota de registro de administrador
router.post(
    '/register-admin',
    [
        body('name').notEmpty().withMessage('Nome é obrigatório.'),
        body('email').isEmail().withMessage('E-mail inválido.'),
        body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
    ],
    authController.registerAdmin // <-- Esta é a linha 35 (ou próxima)
);

// Rota de login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('E-mail inválido.'),
        body('password').notEmpty().withMessage('Senha é obrigatória.'),
    ],
    authController.loginUser // <-- Esta é a linha onde o loginUser é usado
);

module.exports = router;
