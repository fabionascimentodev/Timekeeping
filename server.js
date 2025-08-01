// server.js (ou index.js)
const app = require('./src/app'); // Importa o aplicativo Express que você definiu em src/app.js

// Define a porta em que o servidor irá escutar.
// Ele tentará usar a porta definida pela variável de ambiente PORT (usada pelo Railway),
// ou usará a porta 5000 como padrão se PORT não estiver definida (para desenvolvimento local).
const PORT = process.env.PORT || 5000;

// Inicia o servidor Express para escutar por requisições na porta especificada.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
