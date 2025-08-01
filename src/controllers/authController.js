// src/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // Importa a validação

// Função para registrar um novo administrador
exports.registerAdmin = async (req, res) => {
    const errors = validationResult(req); // Verifica os erros da requisição
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    // ... (o restante do código é o mesmo)

    try {
        // ... (o restante do código é o mesmo)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// Função para fazer login de um usuário
exports.login = async (req, res) => {
    const errors = validationResult(req); // Verifica os erros da requisição
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    // ... (o restante do código é o mesmo)

    try {
        // ... (o restante do código é o mesmo)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};