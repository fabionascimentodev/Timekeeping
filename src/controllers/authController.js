// src/controllers/authController.js
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // Mantenha comentado por enquanto para depuração

// Função auxiliar para gerar JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// EXPORTADO CORRETAMENTE
exports.registerAdmin = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        const adminExists = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
        if (adminExists.rows.length > 0) {
            return res.status(400).json({ message: 'Um administrador com este e-mail já existe.' });
        }

        const hashedPassword = password; // Apenas para teste

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'admin']
        );

        const user = result.rows[0];
        const token = generateToken(user.id);

        res.status(201).json({
            msg: 'Administrador registrado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Erro ao registrar administrador:', error.message);
        next(error);
    }
};

// EXPORTADO CORRETAMENTE
exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = (password === user.password); // Apenas para teste

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            msg: 'Login bem-sucedido!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        next(error);
    }
};
