const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/bookController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /api/books:
 *   get:
 *     tags: [Livros]
 *     summary: Lista livros, com filtros opcionais
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isbn
 *         schema: { type: string }
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Lista de livros }
 *   post:
 *     tags: [Livros]
 *     summary: Cadastra um livro (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, publisher, publicationYear, category, isbn, totalQuantity]
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               publisher: { type: string }
 *               publicationYear: { type: integer }
 *               category: { type: string }
 *               isbn: { type: string }
 *               totalQuantity: { type: integer }
 *     responses:
 *       201: { description: Livro criado }
 */
router.get('/', list);
router.post('/', authorize('administrador', 'bibliotecario'), create);

/**
 * @openapi
 * /api/books/{id}:
 *   get:
 *     tags: [Livros]
 *     summary: Consulta um livro por id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Livro encontrado }
 *       404: { description: Livro não encontrado }
 *   put:
 *     tags: [Livros]
 *     summary: Atualiza um livro (administrador ou bibliotecário)
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
 *               title: { type: string }
 *               author: { type: string }
 *               publisher: { type: string }
 *               publicationYear: { type: integer }
 *               category: { type: string }
 *               isbn: { type: string }
 *               totalQuantity: { type: integer }
 *     responses:
 *       200: { description: Livro atualizado }
 *   delete:
 *     tags: [Livros]
 *     summary: Exclui um livro (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Livro excluído }
 */
router.get('/:id', getById);
router.put('/:id', authorize('administrador', 'bibliotecario'), update);
router.delete('/:id', authorize('administrador', 'bibliotecario'), remove);

module.exports = router;
