const express = require('express');
const { list, getById, getMe, create, update, inactivate, remove } = require('../controllers/readerController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /api/readers/me:
 *   get:
 *     tags: [Leitores]
 *     summary: Retorna o perfil de leitor do usuário autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Perfil do leitor }
 */
router.get('/me', getMe);

router.use(authorize('administrador', 'bibliotecario'));

/**
 * @openapi
 * /api/readers:
 *   get:
 *     tags: [Leitores]
 *     summary: Lista leitores, com busca por nome, CPF ou RA (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de leitores }
 *   post:
 *     tags: [Leitores]
 *     summary: Cadastra um leitor, criando também sua conta de usuário (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, cpfRa, phone, address]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               cpfRa: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       201: { description: Leitor criado }
 */
router.get('/', list);
router.post('/', create);

/**
 * @openapi
 * /api/readers/{id}:
 *   get:
 *     tags: [Leitores]
 *     summary: Consulta um leitor por id (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Leitor encontrado }
 *       404: { description: Leitor não encontrado }
 *   put:
 *     tags: [Leitores]
 *     summary: Atualiza os dados de um leitor (administrador ou bibliotecário)
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
 *               cpfRa: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               status: { type: string, enum: [ativo, inativo] }
 *     responses:
 *       200: { description: Leitor atualizado }
 *   delete:
 *     tags: [Leitores]
 *     summary: Exclui um leitor (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Leitor excluído }
 */
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

/**
 * @openapi
 * /api/readers/{id}/inactivate:
 *   patch:
 *     tags: [Leitores]
 *     summary: Inativa um leitor (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Leitor inativado }
 */
router.patch('/:id/inactivate', inactivate);

module.exports = router;
