const express = require('express');
const { list, getById, create, returnLoan } = require('../controllers/loanController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /api/loans:
 *   get:
 *     tags: [Empréstimos]
 *     summary: Lista empréstimos (leitor vê apenas os próprios; admin/bibliotecário veem todos)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [aberto, devolvido, atrasado] }
 *       - in: query
 *         name: readerId
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Lista de empréstimos }
 *   post:
 *     tags: [Empréstimos]
 *     summary: Registra um empréstimo (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [readerId, bookId]
 *             properties:
 *               readerId: { type: integer }
 *               bookId: { type: integer }
 *               bookIds:
 *                 type: array
 *                 items: { type: integer }
 *               dueDate: { type: string, format: date }
 *     responses:
 *       201: { description: Empréstimo(s) criado(s) }
 *       400: { description: Regra de negócio violada (sem estoque, leitor inativo, etc.) }
 */
router.get('/', list);
router.post('/', authorize('administrador', 'bibliotecario'), create);

/**
 * @openapi
 * /api/loans/{id}:
 *   get:
 *     tags: [Empréstimos]
 *     summary: Consulta um empréstimo por id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Empréstimo encontrado }
 *       403: { description: Leitor tentando ver empréstimo de outro leitor }
 *       404: { description: Empréstimo não encontrado }
 */
router.get('/:id', getById);

/**
 * @openapi
 * /api/loans/{id}/return:
 *   patch:
 *     tags: [Empréstimos]
 *     summary: Registra a devolução de um empréstimo (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Devolução registrada, disponibilidade do livro atualizada }
 */
router.patch('/:id/return', authorize('administrador', 'bibliotecario'), returnLoan);

module.exports = router;
