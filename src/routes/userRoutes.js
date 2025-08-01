// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação
const authorize = require('../middleware/authorizationMiddleware'); // Importa o middleware de autorização
const { body } = require('express-validator'); // Para validação de entrada

// Rota para obter o perfil do usuário logado (requer autenticação)
// GET /api/users/me
router.get('/me', authMiddleware, userController.getLoggedInUser);

// Rota para obter todos os usuários (requer autenticação e role 'admin')
// GET /api/users
router.get('/', authMiddleware, authorize(['admin']), userController.getAllUsers);

// Rota para obter um usuário por ID (requer autenticação)
// GET /api/users/:userId
router.get('/:userId', authMiddleware, userController.getUserById);

// Rota para atualizar um usuário (requer autenticação)
// Permite que o próprio usuário atualize seu perfil ou admin atualize qualquer um
// PUT /api/users/:userId
router.put(
    '/:userId',
    authMiddleware,
    [
        // Validação para campos de atualização
        body('name')
            .optional()
            .trim() // Remove espaços em branco do início/fim
            .notEmpty()
            .withMessage('O nome não pode ser vazio.'),
        body('email')
            .optional()
            .isEmail()
            .withMessage('Por favor, insira um email válido.'),
        body('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('A senha deve ter pelo menos 6 caracteres.')
            .matches(/\d/)
            .withMessage('A senha deve conter pelo menos um número.')
            .matches(/[a-z]/)
            .withMessage('A senha deve conter pelo menos uma letra minúscula.')
            .matches(/[A-Z]/)
            .withMessage('A senha deve conter pelo menos uma letra maiúscula.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('A senha deve conter pelo menos um caractere especial.'),
        body('role')
            .optional()
            .isIn(['user', 'admin'])
            .withMessage('O papel deve ser "user" ou "admin".')
    ],
    async (req, res, next) => {
        // Middleware para verificar se o usuário logado pode atualizar este perfil
        // Permite que o próprio usuário atualize ou um admin
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para atualizar este usuário.' });
        }
        next();
    },
    userController.updateUser
);

// Rota para deletar um usuário (requer autenticação e role 'admin')
// DELETE /api/users/:userId
router.delete('/:userId', authMiddleware, authorize(['admin']), userController.deleteUser);


module.exports = router;
