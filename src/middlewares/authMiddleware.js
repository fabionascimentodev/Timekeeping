// Lógica para proteger rotas com JWT

// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Obter o token do cabeçalho
    const token = req.header('x-auth-token');

    // Verificar se não há token
    if (!token) {
        return res.status(401).json({ msg: 'Nenhum token, autorização negada' });
    }

    try {
        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adicionar o usuário do payload ao objeto de requisição
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};