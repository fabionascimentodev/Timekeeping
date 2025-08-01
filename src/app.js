// src/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const dotenv = require('dotenv'); // NÃO DEVE ESTAR AQUI
const authRoutes = require('./routes/authRoutes'); // ESTAS LINHAS DEVEM ESTAR AQUI
const userRoutes = require('./routes/userRoutes'); // ESTAS LINHAS DEVEM ESTAR AQUI
const clockRoutes = require('./routes/clockRoutes'); // ESTAS LINHAS DEVEM ESTAR AQUI
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// REMOVA ESTE BLOCO, POIS O dotenv.config() SERÁ CHAMADO EM server.js
// console.log('--- app.js: Iniciando carregamento de variáveis de ambiente ---');
// if (process.env.NODE_ENV !== 'production') {
//     dotenv.config();
//     console.log('--- app.js: Variáveis de ambiente carregadas via dotenv ---');
// } else {
//     console.log('--- app.js: Ambiente de produção, dotenv não carregado. Usando variáveis do Railway. ---');
// }

console.log('--- app.js: JWT_SECRET (primeiros 5 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) : 'UNDEFINED');
console.log('--- app.js: DATABASE_URL (primeiros 10 chars):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : 'UNDEFINED');


const app = express();
console.log('--- app.js: Instância Express criada ---');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
console.log('--- app.js: Middlewares CORS e bodyParser configurados ---');

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('API de Controle de Ponto está rodando...');
    console.log('--- app.js: Requisição GET / recebida ---');
});

// Rotas da API
app.use('/api/auth', authRoutes); // E ESTAS LINHAS DEVEM ESTAR AQUI
app.use('/api/users', userRoutes); // E ESTAS LINHAS DEVEM ESTAR AQUI
app.use('/api/clock', clockRoutes); // E ESTAS LINHAS DEVEM ESTAR AQUI
console.log('--- app.js: Rotas da API configuradas ---');

// Middlewares de tratamento de erros
app.use(notFound);
app.use(errorHandler);
console.log('--- app.js: Middlewares de tratamento de erros configurados ---');

module.exports = app;
console.log('--- app.js: Módulo app exportado ---');
