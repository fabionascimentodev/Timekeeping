// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // Importa a função body
const authController = require('../controllers/authController');

// @route   POST /api/auth/register-admin
// @desc    Registrar o primeiro administrador
// @access  Public
router.post(
    '/register-admin',
    [
        body('name', 'O nome é obrigatório').not().isEmpty(),
        body('email', 'Por favor, inclua um email válido').isEmail(),
        body('password', 'A senha deve ter 6 ou mais caracteres').isLength({ min: 6 })
    ],
    authController.registerAdmin
);

// @route   POST /api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post(
    '/login',
    [
        body('email', 'Por favor, inclua um email válido').isEmail(),
        body('password', 'A senha é obrigatória').exists()
    ],
    authController.login
);

module.exports = router;