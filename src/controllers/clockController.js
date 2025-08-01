// src/controllers/clockController.js
const pool = require('../config/db'); // Importa o pool de conexão com o banco de dados
const { validationResult } = require('express-validator'); // Para validação de requisições

// Função para registrar entrada de ponto (clock-in)
exports.clockIn = async (req, res) => {
    // Validação dos dados de entrada (opcional, mas recomendado para latitude/longitude)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // O user_id vem do token JWT, adicionado pelo authMiddleware
    const userId = req.user.id;
    // O tipo de ponto (in/out) e localização vêm do corpo da requisição
    const { latitude, longitude } = req.body; // latitude e longitude são opcionais

    try {
        // Verifica se o usuário já fez um clock-in sem um clock-out correspondente
        // Isso evita múltiplos clock-ins sem um out
        const lastEntryQuery = `
            SELECT clock_type FROM clock_entries
            WHERE user_id = $1
            ORDER BY timestamp DESC
            LIMIT 1;
        `;
        const lastEntryResult = await pool.query(lastEntryQuery, [userId]);

        if (lastEntryResult.rows.length > 0 && lastEntryResult.rows[0].clock_type === 'in') {
            return res.status(400).json({ msg: 'Você já fez um registro de entrada sem um registro de saída correspondente.' });
        }

        // Insere o registro de entrada no banco de dados
        const insertQuery = `
            INSERT INTO clock_entries (user_id, clock_type, latitude, longitude)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const newEntry = await pool.query(insertQuery, [userId, 'in', latitude, longitude]);

        res.status(201).json({
            msg: 'Registro de entrada realizado com sucesso!',
            entry: newEntry.rows[0]
        });

    } catch (err) {
        console.error('Erro ao registrar entrada de ponto:', err.message);
        res.status(500).send('Erro no servidor ao registrar entrada.');
    }
};

// Função para registrar saída de ponto (clock-out)
exports.clockOut = async (req, res) => {
    // Validação dos dados de entrada (opcional, mas recomendado para latitude/longitude)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // O user_id vem do token JWT
    const userId = req.user.id;
    const { latitude, longitude } = req.body; // latitude e longitude são opcionais

    try {
        // Verifica se o usuário já fez um clock-out sem um clock-in correspondente
        // Isso evita múltiplos clock-outs sem um in
        const lastEntryQuery = `
            SELECT clock_type FROM clock_entries
            WHERE user_id = $1
            ORDER BY timestamp DESC
            LIMIT 1;
        `;
        const lastEntryResult = await pool.query(lastEntryQuery, [userId]);

        if (lastEntryResult.rows.length === 0 || lastEntryResult.rows[0].clock_type === 'out') {
            return res.status(400).json({ msg: 'Você não tem um registro de entrada ativo para registrar uma saída.' });
        }

        // Insere o registro de saída no banco de dados
        const insertQuery = `
            INSERT INTO clock_entries (user_id, clock_type, latitude, longitude)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const newEntry = await pool.query(insertQuery, [userId, 'out', latitude, longitude]);

        res.status(201).json({
            msg: 'Registro de saída realizado com sucesso!',
            entry: newEntry.rows[0]
        });

    } catch (err) {
        console.error('Erro ao registrar saída de ponto:', err.message);
        res.status(500).send('Erro no servidor ao registrar saída.');
    }
};

// Função para obter relatório de ponto de um usuário (ainda não implementada completamente)
exports.getClockReport = async (req, res) => {
    // O user_id vem dos parâmetros da URL
    const { userId } = req.params; // Note: req.params.userId

    try {
        // Exemplo: Buscar todas as entradas de ponto para o userId fornecido
        const reportQuery = `
            SELECT * FROM clock_entries
            WHERE user_id = $1
            ORDER BY timestamp ASC;
        `;
        const reportResult = await pool.query(reportQuery, [userId]);

        res.status(200).json(reportResult.rows);

    } catch (err) {
        console.error('Erro ao obter relatório de ponto:', err.message);
        res.status(500).send('Erro no servidor ao obter relatório de ponto.');
    }
};

// Função para obter o salário mensal (placeholder)
exports.getMonthlySalary = async (req, res) => {
    res.status(501).json({ msg: 'Funcionalidade de salário mensal ainda não implementada.' });
};
