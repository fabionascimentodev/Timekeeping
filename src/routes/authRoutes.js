// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // Importa 'body' para validação
const authController = require('../controllers/authController');

// Rota para registrar um novo administrador
// POST /api/auth/register-admin
router.post(
    '/register-admin',
    [
        body('name')
            .notEmpty()
            .withMessage('O nome é obrigatório.'),
        body('email')
            .isEmail()
            .withMessage('Por favor, insira um email válido.'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('A senha deve ter pelo menos 6 caracteres.')
            .matches(/\d/)
            .withMessage('A senha deve conter pelo menos um número.')
            .matches(/[a-z]/)
            .withMessage('A senha deve conter pelo menos uma letra minúscula.')
            .matches(/[A-Z]/)
            .withMessage('A senha deve conter pelo menos uma letra maiúscula.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('A senha deve conter pelo menos um caractere especial.')
    ],
    authController.registerAdmin
);

// Rota para fazer login de um usuário
// POST /api/auth/login
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Por favor, insira um email válido.'),
        body('password')
            .notEmpty()
            .withMessage('A senha é obrigatória.')
    ],
    authController.login
);

module.exports = router;
