// server.js (Versão Mínima para Teste)
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('--- TESTE: Servidor Express Mínimo Iniciando ---');

app.get('/', (req, res) => {
    res.send('TESTE: Servidor Express Mínimo está funcionando!');
    console.log('--- TESTE: Requisição GET / recebida no servidor mínimo ---');
});

app.listen(PORT, () => {
    console.log(`--- TESTE: Servidor Express Mínimo rodando na porta ${PORT} ---`);
    console.log('--- TESTE: Servidor Express Mínimo está escutando ---');
}).on('error', (err) => {
    console.error('--- TESTE: ERRO AO INICIAR SERVIDOR MÍNIMO:', err);
    process.exit(1);
});

console.log('--- TESTE: Script de inicialização do servidor mínimo concluído ---');
