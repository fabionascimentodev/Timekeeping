// src/controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Obter todos os funcionários (apenas para admin)
// @route   GET /api/users
exports.getEmployees = async (req, res) => {
    try {
        const allEmployees = await pool.query('SELECT id, name, email, daily_rate, role, created_at FROM users WHERE role = $1', ['employee']);
        res.json(allEmployees.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Adicionar um novo funcionário (apenas para admin)
// @route   POST /api/users
exports.addEmployee = async (req, res) => {
    const { name, email, password, daily_rate } = req.body;

    try {
        // Criptografar a senha do novo funcionário
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Inserir o novo funcionário no banco de dados
        const newEmployee = await pool.query(
            'INSERT INTO users (name, email, password_hash, daily_rate, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, daily_rate, role',
            [name, email, password_hash, daily_rate, 'employee']
        );

        res.status(201).json(newEmployee.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Atualizar um funcionário (apenas para admin)
// @route   PUT /api/users/:id
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Verificar se há algo para atualizar
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ msg: 'Nenhum campo para atualizar' });
    }

    try {
        const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
        const values = Object.values(updates);
        values.push(id); // Adiciona o ID ao final do array de valores

        const updatedEmployee = await pool.query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, name, email, daily_rate`,
            values
        );

        if (updatedEmployee.rows.length === 0) {
            return res.status(404).json({ msg: 'Funcionário não encontrado' });
        }

        res.json(updatedEmployee.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Deletar um funcionário (apenas para admin)
// @route   DELETE /api/users/:id
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEmployee = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        
        if (deletedEmployee.rows.length === 0) {
            return res.status(404).json({ msg: 'Funcionário não encontrado' });
        }

        res.json({ msg: `Funcionário com ID ${id} deletado com sucesso` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};