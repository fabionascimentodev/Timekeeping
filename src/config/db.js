// src/config/db.js
const { Pool } = require('pg');

// Adiciona um log para ver o valor completo da DATABASE_URL antes de ser usada
console.log('--- db.js: Valor de process.env.DATABASE_URL:', process.env.DATABASE_URL);

// Parseia a DATABASE_URL para extrair as propriedades individuais
const connectionString = process.env.DATABASE_URL;
let config = {};

if (connectionString) {
    const url = new URL(connectionString);
    config = {
        user: url.username,
        host: url.hostname,
        database: url.pathname.substring(1), // Remove a barra inicial
        password: url.password,
        port: url.port ? parseInt(url.port, 10) : 5432, // Porta padrão 5432
        ssl: false // Desabilita explicitamente a conexão SSL
    };
} else {
    // Fallback ou erro se DATABASE_URL não estiver definida (não deve acontecer com .env correto)
    console.error('--- db.js: DATABASE_URL não está definida. Verifique seu arquivo .env ---');
    process.exit(1); // Encerra a aplicação se a URL do DB for crítica
}

const pool = new Pool(config);

// Adiciona um listener para erros do pool de conexão
pool.on('error', (err, client) => {
    console.error('Erro inesperado no cliente ocioso do pool de DB', err);
    process.exit(-1); // Encerra o processo se houver um erro grave no pool
});

// Opcional: Logar quando um cliente é conectado ou liberado
pool.on('connect', client => {
    console.log('Cliente de DB conectado');
});

pool.on('release', client => {
    console.log('Cliente de DB liberado para o pool');
});

// Testa a conexão ao iniciar
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao testar conexão com o PostgreSQL:', err.message);
        // Se a conexão de teste falhar, pode ser um problema de credenciais ou rede
        process.exit(1); // Encerra a aplicação se não conseguir conectar
    } else {
        console.log('Conectado ao PostgreSQL!');
    }
});

module.exports = pool;
