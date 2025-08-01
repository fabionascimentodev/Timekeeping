const { Pool } = require('pg');

let pool;

if (process.env.NODE_ENV === 'production') {
  // Configuração para o Railway (produção)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Configuração para o ambiente de desenvolvimento local (usando .env)
  require('dotenv').config();
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

// Teste de conexão
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
    } else {
        console.log('Conectado ao PostgreSQL!');
        release();
    }
});

module.exports = pool;
