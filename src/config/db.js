    // src/config/db.js
    const { Pool } = require('pg');

    console.log('--- db.js: Valor de process.env.DATABASE_URL:', process.env.DATABASE_URL);

    const connectionString = process.env.DATABASE_URL;
    let config = {};

    if (connectionString) {
        const url = new URL(connectionString);
        config = {
            user: url.username,
            host: url.hostname,
            database: url.pathname.substring(1),
            password: url.password,
            port: url.port ? parseInt(url.port, 10) : 5432,
            // REMOVA A LINHA ssl: false AQUI
        };
    } else {
        console.error('--- db.js: DATABASE_URL não está definida. Verifique seu arquivo .env ---');
        process.exit(1);
    }

    const pool = new Pool(config);

    pool.on('error', (err, client) => {
        console.error('Erro inesperado no cliente ocioso do pool de DB', err);
        process.exit(-1);
    });

    pool.on('connect', client => {
        console.log('Cliente de DB conectado');
    });

    pool.on('release', client => {
        console.log('Cliente de DB liberado para o pool');
    });

    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Erro ao testar conexão com o PostgreSQL:', err.message);
            process.exit(1);
        } else {
            console.log('Conectado ao PostgreSQL!');
        }
    });

    module.exports = pool;
    