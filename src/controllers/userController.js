// src/controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Obter o perfil do usuário logado
exports.getLoggedInUser = async (req, res) => {
    try {
        // req.user.id é definido pelo authMiddleware após a verificação do token
        const userQuery = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [req.user.id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        res.json(userResult.rows[0]);
    } catch (err) {
        console.error('Erro ao obter usuário logado:', err.message);
        res.status(500).send('Erro no servidor.');
    }
};

// Obter todos os usuários (apenas para administradores)
exports.getAllUsers = async (req, res) => {
    try {
        const usersQuery = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
        const usersResult = await pool.query(usersQuery);

        res.json(usersResult.rows);
    } catch (err) {
        console.error('Erro ao obter todos os usuários:', err.message);
        res.status(500).send('Erro no servidor.');
    }
};

// Obter usuário por ID
exports.getUserById = async (req, res) => {
    const { userId } = req.params; // ID do usuário vem dos parâmetros da URL

    try {
        const userQuery = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        res.json(userResult.rows[0]);
    } catch (err) {
        console.error('Erro ao obter usuário por ID:', err.message);
        res.status(500).send('Erro no servidor.');
    }
};

// Atualizar informações de um usuário
exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { name, email, password, role } = req.body;

    // Validação básica (pode ser expandida com express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let hashedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Construir a query de atualização dinamicamente
        let updateQuery = 'UPDATE users SET ';
        const queryParams = [];
        let paramIndex = 1;

        if (name) {
            updateQuery += `name = $${paramIndex}, `;
            queryParams.push(name);
            paramIndex++;
        }
        if (email) {
            updateQuery += `email = $${paramIndex}, `;
            queryParams.push(email);
            paramIndex++;
        }
        if (hashedPassword) {
            updateQuery += `password = $${paramIndex}, `;
            queryParams.push(hashedPassword);
            paramIndex++;
        }
        // Permite que apenas administradores atualizem o papel
        if (role && req.user.role === 'admin') {
            updateQuery += `role = $${paramIndex}, `;
            queryParams.push(role);
            paramIndex++;
        } else if (role && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para alterar o papel do usuário.' });
        }

        // Remover a última vírgula e espaço
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${paramIndex} RETURNING id, name, email, role`;
        queryParams.push(userId);

        if (queryParams.length === 1) { // Apenas o userId, significa que não há campos para atualizar
            return res.status(400).json({ msg: 'Nenhum campo fornecido para atualização.' });
        }

        const updatedUser = await pool.query(updateQuery, queryParams);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        res.json({ msg: 'Usuário atualizado com sucesso!', user: updatedUser.rows[0] });

    } catch (err) {
        console.error('Erro ao atualizar usuário:', err.message);
        res.status(500).send('Erro no servidor.');
    }
};

// Deletar um usuário
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const deletedUser = await pool.query(deleteQuery, [userId]);

        if (deletedUser.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        res.json({ msg: 'Usuário deletado com sucesso!' });
    } catch (err) {
        console.error('Erro ao deletar usuário:', err.message);
        res.status(500).send('Erro no servidor.');
    }
};
