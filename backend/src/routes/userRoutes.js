const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize('administrador'));

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Usuários]
 *     summary: Lista todos os usuários do sistema (somente administrador)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *   post:
 *     tags: [Usuários]
 *     summary: Cadastra um novo usuário do sistema (somente administrador)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [administrador, bibliotecario, leitor] }
 *     responses:
 *       201:
 *         description: Usuário criado
 */
router.get('/', list);
router.post('/', create);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Usuários]
 *     summary: Consulta um usuário por id (somente administrador)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Usuário encontrado }
 *       404: { description: Usuário não encontrado }
 *   put:
 *     tags: [Usuários]
 *     summary: Atualiza um usuário (somente administrador)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [administrador, bibliotecario, leitor] }
 *     responses:
 *       200: { description: Usuário atualizado }
 *   delete:
 *     tags: [Usuários]
 *     summary: Exclui um usuário (somente administrador)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Usuário excluído }
 */
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
