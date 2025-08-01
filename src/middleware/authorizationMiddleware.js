// src/middleware/authorizationMiddleware.js
module.exports = (roles) => {
    return (req, res, next) => {
        // Verifica se o usuário está autenticado (req.user deve vir do authMiddleware)
        if (!req.user || !req.user.role) {
            return res.status(403).json({ msg: 'Acesso negado. Token de autenticação inválido ou ausente.' });
        }

        // Verifica se o papel do usuário está incluído nos papéis permitidos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
        }

        next(); // Se o usuário tiver o papel necessário, passa para a próxima middleware/rota
    };
};
