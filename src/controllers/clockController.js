// src/controllers/clockController.js
const pool = require('../config/db');

// @desc    Registrar uma marcação de ponto
// @route   POST /api/clock
// @access  Private (apenas para o funcionário logado)
exports.clockIn = async (req, res) => {
    const { clock_type } = req.body;
    const user_id = req.user.id; // O ID do usuário vem do middleware

    try {
        const newClockEntry = await pool.query(
            'INSERT INTO clock_entries (user_id, clock_type) VALUES ($1, $2) RETURNING *',
            [user_id, clock_type]
        );
        res.status(201).json(newClockEntry.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Obter relatório de ponto de um usuário (apenas para o próprio ou admin)
// @route   GET /api/clock/report/:id
// @access  Private (porém com validação de role)
exports.getClockReport = async (req, res) => {
    const user_id_from_url = req.params.id;
    const logged_in_user_id = req.user.id;
    const logged_in_user_role = req.user.role;

    try {
        // Validação: apenas o próprio usuário ou um admin pode ver o relatório
        if (logged_in_user_role !== 'admin' && user_id_from_url !== logged_in_user_id.toString()) {
            return res.status(403).json({ msg: 'Acesso negado' });
        }

        const report = await pool.query(
            'SELECT * FROM clock_entries WHERE user_id = $1 ORDER BY timestamp DESC',
            [user_id_from_url]
        );
        res.json(report.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Obter salário mensal de um usuário (apenas para o próprio ou admin)
// @route   GET /api/clock/salary/:id
// @access  Private (com validação de role)
exports.getMonthlySalary = async (req, res) => {
    const user_id_from_url = req.params.id;
    const logged_in_user_id = req.user.id;
    const logged_in_user_role = req.user.role;

    try {
        // Validação: apenas o próprio usuário ou um admin pode ver o salário
        if (logged_in_user_role !== 'admin' && user_id_from_url !== logged_in_user_id.toString()) {
            return res.status(403).json({ msg: 'Acesso negado' });
        }

        // 1. Obter a taxa diária do usuário
        const user = await pool.query('SELECT daily_rate FROM users WHERE id = $1', [user_id_from_url]);
        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        const daily_rate = parseFloat(user.rows[0].daily_rate);

        // 2. Obter todas as marcações de ponto do mês atual para o usuário
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const clockEntries = await pool.query(
            'SELECT clock_type, timestamp FROM clock_entries WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3 ORDER BY timestamp ASC',
            [user_id_from_url, startOfMonth, endOfMonth]
        );

        // 3. Processar as marcações para calcular as horas totais
        let totalHours = 0;
        let arrivalTime = null;
        let lunchStartTime = null;
        
        clockEntries.rows.forEach(entry => {
            const timestamp = new Date(entry.timestamp);

            if (entry.clock_type === 'arrival') {
                arrivalTime = timestamp;
            } else if (entry.clock_type === 'lunch_start') {
                lunchStartTime = timestamp;
            } else if (entry.clock_type === 'lunch_end' && lunchStartTime) {
                // Calcula a duração do almoço em horas e subtrai
                const lunchDuration = (timestamp - lunchStartTime) / (1000 * 60 * 60);
                if (arrivalTime) {
                    const workDuration = (timestamp - arrivalTime) / (1000 * 60 * 60);
                    totalHours += workDuration - lunchDuration;
                }
                lunchStartTime = null; // Zera para o próximo ciclo
            } else if (entry.clock_type === 'departure' && arrivalTime) {
                // Se a saída for registrada sem almoço, calcula a partir da chegada
                const workDuration = (timestamp - arrivalTime) / (1000 * 60 * 60);
                totalHours += workDuration;
                arrivalTime = null; // Zera para o próximo dia
            }
        });

        // 4. Calcular o salário
        const monthlySalary = totalHours * daily_rate / 8; // Divide por 8 para obter o valor da hora

        res.json({
            total_hours: totalHours.toFixed(2),
            daily_rate: daily_rate.toFixed(2),
            monthly_salary: monthlySalary.toFixed(2)
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};