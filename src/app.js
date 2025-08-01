// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clockRoutes = require('./routes/clockRoutes');
const pool = require('./config/db'); // Importa a conexão com o banco de dados

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- ADICIONE ESTE MIDDLEWARE DE LOG AQUI ---
app.use((req, res, next) => {
    console.log(`Requisição recebida: ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next(); // Continua para a próxima middleware/rota
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clock', clockRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('API Timekeeping funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});