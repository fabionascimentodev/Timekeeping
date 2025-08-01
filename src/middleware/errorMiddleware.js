// src/middleware/errorMiddleware.js

// Middleware para lidar com erros 404 (Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`Não encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error); // Passa o erro para o próximo middleware (o de tratamento de erros)
};

// Middleware de tratamento de erros geral
const errorHandler = (err, req, res, next) => {
    // Se o status code já foi definido e não é 200, usa o que já está.
    // Caso contrário, define como 500 (Internal Server Error).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message, // Mensagem de erro para o cliente
        // Em ambiente de produção, não expor o stack trace para segurança
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
