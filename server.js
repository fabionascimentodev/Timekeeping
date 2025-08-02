    // server.js (na raiz do projeto)
    const dotenv = require('dotenv');

    // Handler global para exceções não capturadas - APENAS PARA DEPURACAO
    process.on('uncaughtException', (err) => {
        console.error('ERRO FATAL NÃO CAPTURADO NA INICIALIZAÇÃO (server.js):', err);
        console.error('Stack Trace:', err.stack);
        process.exit(1);
    });

    console.log('--- server.js: [1] Iniciando script ---');

    if (process.env.NODE_ENV !== 'production') {
        dotenv.config();
        console.log('--- server.js: [2] Variáveis de ambiente carregadas via dotenv ---');
    } else {
        console.log('--- server.js: [2] Ambiente de produção. dotenv não carregado. ---');
    }

    console.log('--- server.js: [3] Valor de process.env.PORT antes de app.listen:', process.env.PORT);

    const app = require('./src/app');
    console.log('--- server.js: [4] Módulo app importado com sucesso ---');

    const PORT = process.env.PORT || 5000;
    console.log(`--- server.js: [5] Porta definida como ${PORT} ---`);

    try {
        console.log(`--- server.js: [6] Tentando iniciar o servidor Express na porta ${PORT} ---`);
        const server = app.listen(PORT, () => {
            console.log(`--- server.js: [7] Servidor Express rodando na porta ${PORT} ---`);
            console.log(`--- server.js: [8] Ambiente: ${process.env.NODE_ENV || 'development'} ---`);
            console.log('--- server.js: [9] Servidor Express está escutando e pronto para requisições ---');
        });

        server.on('error', (err) => { // Captura erros de listen (ex: porta já em uso)
            console.error('--- server.js: [10] ERRO AO ESCUTAR NA PORTA (server.js):', err);
            console.error('Stack Trace:', err.stack);
            process.exit(1);
        });

        server.on('listening', () => {
            console.log('--- server.js: [11] Evento "listening" disparado. Servidor pronto. ---');
        });

        console.log('--- server.js: [12] Chamada app.listen retornou. ---');

    } catch (error) {
        console.error('--- server.js: [13] ERRO AO CHAMAR app.listen (server.js):', error);
        console.error('Stack Trace:', error.stack);
        process.exit(1);
    }
    console.log('--- server.js: [14] Script de inicialização concluído (após app.listen) ---');
    