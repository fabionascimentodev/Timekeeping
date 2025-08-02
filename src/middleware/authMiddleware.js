// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// REMOVA ESTE BLOCO, pois dotenv.config() já é chamado em server.js
// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

// Middleware de autenticação
module.exports = function (req, res, next) {
    // Obter o token do cabeçalho
    // O token é geralmente enviado no formato "Bearer TOKEN_JWT_AQUI"
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Verificar se o token existe
    if (!token) {
        return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
    }

    try {
        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adicionar o usuário do payload do token ao objeto de requisição
        // CORREÇÃO: Atribua 'decoded' diretamente a 'req.user', pois 'decoded' já contém o 'id'
        req.user = decoded; // 'decoded' é { id: '...', iat: ..., exp: ... }
        next(); // Passar para a próxima middleware/rota
    } catch (err) {
        // Se o token for inválido (expirado, modificado, etc.)
        res.status(401).json({ msg: 'Token inválido.' });
    }
};
