const express = require('express');
const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Autentica um usuário e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@biblioteca.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso, retorna token JWT e dados do usuário
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Autenticação]
 *     summary: Retorna os dados do usuário autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/me', authenticate, me);

module.exports = router;
