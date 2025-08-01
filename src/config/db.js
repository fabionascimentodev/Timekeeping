// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

// Cria um pool de conexões para o PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,        // Usuário do banco de dados (ex: timekeeping_user)
    host: process.env.DB_HOST,        // Host do banco de dados (ex: localhost)
    database: process.env.DB_NAME,    // Nome do banco de dados (ex: timekeeping_db)
    password: process.env.DB_PASSWORD,// Senha do usuário do banco de dados
    port: process.env.DB_PORT,        // Porta do PostgreSQL (padrão: 5432)
});

// Teste de conexão (executado uma vez quando o pool é criado)
pool.connect((err, client, release) => {
    if (err) {
        // Se houver um erro ao tentar conectar, loga o erro e encerra o processo se for crítico
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        // Opcional: process.exit(1); para encerrar a aplicação se a conexão for vital
    } else {
        console.log('Conectado ao PostgreSQL!');
        release(); // Libera o cliente de volta para o pool para ser reutilizado
    }
});

// Exporta o pool de conexões para ser usado por outros módulos da aplicação
module.exports = pool;