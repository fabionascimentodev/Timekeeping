// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas por autenticação
// A rota só será acessível se o token JWT for válido
router.get('/', authMiddleware, userController.getEmployees);
router.post('/', authMiddleware, userController.addEmployee);
router.put('/:id', authMiddleware, userController.updateEmployee);
router.delete('/:id', authMiddleware, userController.deleteEmployee);

module.exports = router;