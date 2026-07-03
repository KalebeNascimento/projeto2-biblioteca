const express = require('express');
const { dashboard } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize('administrador', 'bibliotecario'));

/**
 * @openapi
 * /api/reports/dashboard:
 *   get:
 *     tags: [Relatórios]
 *     summary: Retorna estatísticas gerais do sistema (administrador ou bibliotecário)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Totais de livros, leitores e empréstimos, agregados por status e top 5 livros mais emprestados }
 */
router.get('/dashboard', dashboard);

module.exports = router;
