const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Sistema de Gerenciamento de Biblioteca',
      version: '1.0.0',
      description:
        'API REST para gerenciamento de biblioteca: autenticação JWT, livros, leitores e empréstimos. Projeto 2 da disciplina de Programação Web.',
    },
    servers: [{ url: '/', description: 'Servidor atual' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
