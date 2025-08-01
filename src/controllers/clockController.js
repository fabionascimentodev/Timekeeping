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

// Função para obter relatório de ponto de um usuário
exports.getClockReport = async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query; // Pega startDate e endDate dos query parameters

    try {
        // Validação básica dos query parameters (já deve ser feita na rota com express-validator)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let reportQuery = `
            SELECT clock_type, timestamp
            FROM clock_entries
            WHERE user_id = $1
        `;
        const queryParams = [userId];
        let paramIndex = 2;

        // Adiciona filtro por data se os parâmetros forem fornecidos
        if (startDate && endDate) {
            reportQuery += ` AND timestamp BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            queryParams.push(startDate, endDate);
            paramIndex += 2;
        }

        reportQuery += ` ORDER BY timestamp ASC;`;

        const reportResult = await pool.query(reportQuery, queryParams);
        const entries = reportResult.rows;

        const dailyReport = {};
        let lastInTime = null;

        for (const entry of entries) {
            const date = entry.timestamp.toISOString().split('T')[0]; // Formato YYYY-MM-DD

            if (!dailyReport[date]) {
                dailyReport[date] = {
                    date: date,
                    entries: [],
                    totalHours: 0
                };
            }

            dailyReport[date].entries.push(entry);

            if (entry.clock_type === 'in') {
                lastInTime = entry.timestamp;
            } else if (entry.clock_type === 'out' && lastInTime) {
                const durationMs = entry.timestamp.getTime() - lastInTime.getTime();
                dailyReport[date].totalHours += durationMs / (1000 * 60 * 60); // Converter milissegundos para horas
                lastInTime = null; // Resetar para o próximo par in/out
            }
        }

        // Converte o objeto dailyReport em um array para a resposta
        const formattedReport = Object.values(dailyReport).map(day => ({
            ...day,
            totalHours: parseFloat(day.totalHours.toFixed(2)) // Arredonda para 2 casas decimais
        }));

        res.status(200).json(formattedReport);

    } catch (err) {
        console.error('Erro ao obter relatório de ponto:', err.message);
        res.status(500).send('Erro no servidor ao obter relatório de ponto.');
    }
};

// Função para obter o salário mensal
exports.getMonthlySalary = async (req, res) => {
    const { userId } = req.params;
    const hourlyRate = 25.00; // Exemplo: R$ 25 por hora

    try {
        // Obter o primeiro e o último dia do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Buscar todas as entradas e saídas do mês para o usuário
        const entriesQuery = `
            SELECT clock_type, timestamp
            FROM clock_entries
            WHERE user_id = $1 AND timestamp BETWEEN $2 AND $3
            ORDER BY timestamp ASC;
        `;
        const entriesResult = await pool.query(entriesQuery, [userId, startOfMonth, endOfMonth]);
        const entries = entriesResult.rows;

        let totalHours = 0;
        let lastInTime = null;

        // Iterar sobre as entradas para calcular as horas trabalhadas
        for (const entry of entries) {
            if (entry.clock_type === 'in') {
                lastInTime = entry.timestamp;
            } else if (entry.clock_type === 'out' && lastInTime) {
                const durationMs = entry.timestamp.getTime() - lastInTime.getTime();
                totalHours += durationMs / (1000 * 60 * 60); // Converter milissegundos para horas
                lastInTime = null; // Resetar para o próximo par in/out
            }
        }

        const monthlySalary = totalHours * hourlyRate;

        res.status(200).json({
            userId: userId,
            month: now.getMonth() + 1, // Mês é 0-indexado, então adiciona 1
            year: now.getFullYear(),
            totalHoursWorked: parseFloat(totalHours.toFixed(2)), // Arredonda para 2 casas decimais
            hourlyRate: hourlyRate,
            monthlySalary: parseFloat(monthlySalary.toFixed(2)) // Arredonda para 2 casas decimais
        });

    } catch (err) {
        console.error('Erro ao obter salário mensal:', err.message);
        res.status(500).send('Erro no servidor ao obter salário mensal.');
    }
};
