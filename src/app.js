// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa o middleware de autenticação
// Caminho: './middleware/authMiddleware' (assumindo que authMiddleware.js está em src/middleware/)
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clockRoutes = require('./routes/clockRoutes');
const pool = require('./config/db'); // Importa a conexão com o banco de dados

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de log para depuração (opcional, pode ser removido depois)
app.use((req, res, next) => {
    console.log(`Requisição recebida: ${req.method} ${req.originalUrl}`);
    // console.log('Headers:', req.headers); // Descomente para ver os headers
    // console.log('Body:', req.body);     // Descomente para ver o body
    next(); // Continua para a próxima middleware/rota
});

// Rota de teste (pode ser removida depois de confirmar que tudo funciona)
app.get('/', (req, res) => {
    res.send('API Timekeeping funcionando!');
});

// Rotas da API
// As rotas de autenticação (login, register-admin) NÃO precisam de proteção
app.use('/api/auth', authRoutes);

// Protege as rotas de usuários e de ponto com o middleware de autenticação
app.use('/api/users', authMiddleware, userRoutes); // Aplica authMiddleware antes de userRoutes
app.use('/api/clock', authMiddleware, clockRoutes); // Aplica authMiddleware antes de clockRoutes

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
