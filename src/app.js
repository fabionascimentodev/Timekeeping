// src/app.js
const express = require('express');
const bodyParser = require('body-parser'); // Para analisar corpos de requisição
const cors = require('cors'); // Para habilitar CORS
const dotenv = require('dotenv'); // Para carregar variáveis de ambiente
const authRoutes = require('./routes/authRoutes'); // Importa as rotas de autenticação
const userRoutes = require('./routes/userRoutes'); // Importa as rotas de usuário
const clockRoutes = require('./routes/clockRoutes'); // Importa as rotas de ponto
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Importa os middlewares de erro

// Carrega as variáveis de ambiente do arquivo .env (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();

// Middlewares
app.use(cors()); // Habilita o CORS para todas as origens (pode ser configurado para origens específicas)
app.use(bodyParser.json()); // Habilita o Express a analisar corpos de requisição JSON

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('API de Controle de Ponto está rodando...');
});

// Rotas da API
app.use('/api/auth', authRoutes); // Rotas de autenticação (login, registro)
app.use('/api/users', userRoutes); // Rotas de gerenciamento de usuários
app.use('/api/clock', clockRoutes); // Rotas de controle de ponto

// Middlewares de tratamento de erros
// Este middleware captura requisições para rotas não existentes (404 Not Found)
app.use(notFound);
// Este middleware é o manipulador de erros final
app.use(errorHandler);

module.exports = app;
