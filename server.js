// server.js (na raiz do projeto)
const dotenv = require('dotenv'); // Importa o dotenv

// Carrega as variáveis de ambiente do arquivo .env (apenas em desenvolvimento)
// ESTA LINHA DEVE SER A PRIMEIRA A SER EXECUTADA PARA GARANTIR QUE AS VARIAVEIS ESTEJAM DISPONIVEIS
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    console.log('--- server.js: Variáveis de ambiente carregadas via dotenv ---');
} else {
    console.log('--- server.js: Ambiente de produção, dotenv não carregado. Usando variáveis do Railway. ---');
}

// Importa o aplicativo Express que você definiu em src/app.js
// ESTA É A ÚNICA IMPORTAÇÃO DE MÓDULO DA SUA APLICAÇÃO AQUI.
const app = require('./src/app');

// Define a porta em que o servidor irá escutar.
const PORT = process.env.PORT || 5000;

console.log('--- server.js: Iniciando servidor ---');
// Inicia o servidor Express para escutar por requisições na porta especificada.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('--- server.js: Servidor Express está escutando ---');
});
console.log('--- server.js: Script de inicialização concluído ---');
