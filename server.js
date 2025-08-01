    // server.js (na raiz do projeto)
    const dotenv = require('dotenv'); // Importa o dotenv

    // Handler global para exceções não capturadas - APENAS PARA DEPURACAO
    process.on('uncaughtException', (err) => {
        console.error('ERRO FATAL NÃO CAPTURADO NA INICIALIZAÇÃO:', err);
        console.error('Stack Trace:', err.stack);
        process.exit(1); // Encerra o processo com código de erro
    });

    // Carrega as variáveis de ambiente do arquivo .env (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
        dotenv.config();
        console.log('--- server.js: Variáveis de ambiente carregadas via dotenv ---');
    } else {
        console.log('--- server.js: Ambiente de produção, dotenv não carregado. Usando variáveis do Railway. ---');
    }

    // Importa o aplicativo Express que você definiu em src/app.js
    const app = require('./src/app');

    // Define a porta em que o servidor irá escutar.
    const PORT = process.env.PORT || 5000;

    console.log('--- server.js: Iniciando servidor ---');
    try {
        // Inicia o servidor Express para escutar por requisições na porta especificada.
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('--- server.js: Servidor Express está escutando ---');
        });
    } catch (error) {
        console.error('ERRO AO INICIAR O SERVIDOR EXPRESS:', error);
        console.error('Stack Trace:', error.stack);
        process.exit(1); // Encerra o processo com código de erro
    }
    console.log('--- server.js: Script de inicialização concluído ---');
    