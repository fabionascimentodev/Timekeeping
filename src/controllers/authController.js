// src/controllers/authController.js
const pool = require('../config/db'); // Importa o pool de conexão com o banco de dados
const bcrypt = require('bcryptjs'); // Importa a biblioteca para criptografia de senhas
const jwt = require('jsonwebtoken'); // Importa a biblioteca para JSON Web Tokens
const { validationResult } = require('express-validator'); // Importa a função para verificar resultados de validação

// Carrega as variáveis de ambiente, especialmente o JWT_SECRET
// No ambiente de produção (Railway), o NODE_ENV será 'production' e as variáveis já estarão disponíveis.
// Em desenvolvimento, o dotenv carrega do .env local.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Função para registrar um novo administrador
exports.registerAdmin = async (req, res) => {
    // 1. Validação dos dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Se houver erros de validação, retorna um status 400 com os erros
        return res.status(400).json({ errors: errors.array() });
    }

    // Desestrutura os dados do corpo da requisição
    const { name, email, password } = req.body;

    try {
        // 2. Verificar se já existe um administrador com o email fornecido
        const adminExistsQuery = 'SELECT * FROM users WHERE email = $1 AND role = $2';
        const adminExists = await pool.query(adminExistsQuery, [email, 'admin']);

        if (adminExists.rows.length > 0) {
            // Se um administrador com esse email já existe, retorna um erro 400
            return res.status(400).json({ msg: 'Administrador com este email já existe.' });
        }

        // 3. Criptografar a senha
        const salt = await bcrypt.genSalt(10); // Gera um salt para a criptografia
        const hashedPassword = await bcrypt.hash(password, salt); // Criptografa a senha

        // 4. Inserir o novo administrador no banco de dados
        const insertAdminQuery = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role
        `;
        const newAdmin = await pool.query(insertAdminQuery, [name, email, hashedPassword, 'admin']);

        // 5. Gerar o JSON Web Token (JWT)
        const payload = {
            user: {
                id: newAdmin.rows[0].id,
                role: newAdmin.rows[0].role
            }
        };

        // Assina o token com o segredo JWT e define um tempo de expiração
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Usa a variável de ambiente para o segredo
            { expiresIn: '1h' }, // Token expira em 1 hora
            (err, token) => {
                if (err) throw err; // Se houver erro na geração do token, lança o erro
                // 6. Retorna o token JWT e uma mensagem de sucesso
                res.status(201).json({ msg: 'Administrador registrado com sucesso!', token });
            }
        );

    } catch (err) {
        // Captura e loga qualquer erro inesperado no servidor
        console.error('Erro ao registrar administrador:', err.message);
        // Retorna um status 500 para erros internos do servidor
        res.status(500).send('Erro no servidor.');
    }
};

// Função para fazer login de um usuário
exports.login = async (req, res) => {
    // 1. Validação dos dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Se houver erros de validação, retorna um status 400 com os erros
        return res.status(400).json({ errors: errors.array() });
    }

    // Desestrutura os dados do corpo da requisição
    const { email, password } = req.body;

    try {
        // 2. Verificar se o usuário existe no banco de dados
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            // Se o usuário não for encontrado, retorna um erro 400
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        const user = userResult.rows[0];

        // 3. Comparar a senha fornecida com a senha criptografada no banco de dados
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Se as senhas não corresponderem, retorna um erro 400
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        // 4. Gerar o JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Assina o token com o segredo JWT e define um tempo de expiração
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Usa a variável de ambiente para o segredo
            { expiresIn: '1h' }, // Token expira em 1 hora
            (err, token) => {
                if (err) throw err; // Se houver erro na geração do token, lança o erro
                // 5. Retorna o token JWT
                res.json({ token });
            }
        );

    } catch (err) {
        // Captura e loga qualquer erro inesperado no servidor
        console.error('Erro ao fazer login:', err.message);
        // Retorna um status 500 para erros internos do servidor
        res.status(500).send('Erro no servidor.');
    }
};
