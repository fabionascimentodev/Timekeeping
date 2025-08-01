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

app.post('/test-post', (req, res) => {
    console.log('Recebida requisição POST em /test-post');
    console.log('Corpo da requisição:', req.body);
    res.status(200).json({ message: 'POST de teste recebido com sucesso!', data: req.body });
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