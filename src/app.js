// src/app.js
const express = require('express');
const bodyParser = require('body-parser'); // Para analisar corpos de requisição
const cors = require('cors'); // Para habilitar CORS
const dotenv = require('dotenv'); // Para carregar variáveis de ambiente
const authRoutes = require('./routes/authRoutes'); // Importa as rotas de autenticação
const userRoutes = require('./routes/userRoutes'); // Importa as rotas de usuário
const clockRoutes = require('./routes/clockRoutes'); // Importa as rotas de ponto
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Importa os middlewares de erro

console.log('--- app.js: Iniciando carregamento de variáveis de ambiente ---');
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    console.log('--- app.js: Variáveis de ambiente carregadas via dotenv ---');
} else {
    console.log('--- app.js: Ambiente de produção, dotenv não carregado. Usando variáveis do Railway. ---');
}

console.log('--- app.js: JWT_SECRET (primeiros 5 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) : 'UNDEFINED');
console.log('--- app.js: DATABASE_URL (primeiros 10 chars):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : 'UNDEFINED');


const app = express();
console.log('--- app.js: Instância Express criada ---');

// Middlewares
app.use(cors()); // Habilita o CORS para todas as origens (pode ser configurado para origens específicas)
app.use(bodyParser.json()); // Habilita o Express a analisar corpos de requisição JSON
console.log('--- app.js: Middlewares CORS e bodyParser configurados ---');

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('API de Controle de Ponto está rodando...');
    console.log('--- app.js: Requisição GET / recebida ---');
});

// Rotas da API
app.use('/api/auth', authRoutes); // Rotas de autenticação (login, registro)
app.use('/api/users', userRoutes); // Rotas de gerenciamento de usuários
app.use('/api/clock', clockRoutes); // Rotas de controle de ponto
console.log('--- app.js: Rotas da API configuradas ---');

// Middlewares de tratamento de erros
// Este middleware captura requisições para rotas não existentes (404 Not Found)
app.use(notFound);
// Este middleware é o manipulador de erros final
app.use(errorHandler);
console.log('--- app.js: Middlewares de tratamento de erros configurados ---');

module.exports = app; // Esta é a última linha do app.js
console.log('--- app.js: Módulo app exportado ---');
