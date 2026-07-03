const { Op, fn, col } = require('sequelize');
const { sequelize, Book, Reader, Loan } = require('../models');

async function dashboard(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // atualiza atrasados on-the-fly para a foto ser consistente
    await Loan.update(
      { status: 'atrasado' },
      { where: { status: 'aberto', dueDate: { [Op.lt]: today } } }
    );

    const [totalBooks, totalReaders, activeReaders] = await Promise.all([
      Book.count(),
      Reader.count(),
      Reader.count({ where: { status: 'ativo' } }),
    ]);

    const availableCopiesRow = await Book.findOne({
      attributes: [[fn('COALESCE', fn('SUM', col('available_quantity')), 0), 'total']],
      raw: true,
    });
    const totalCopiesRow = await Book.findOne({
      attributes: [[fn('COALESCE', fn('SUM', col('total_quantity')), 0), 'total']],
      raw: true,
    });

    const loansByStatus = await Loan.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const statusCounts = { aberto: 0, devolvido: 0, atrasado: 0 };
    for (const row of loansByStatus) statusCounts[row.status] = Number(row.count);

    const topBorrowed = await Loan.findAll({
      attributes: ['bookId', [fn('COUNT', col('Loan.id')), 'total']],
      include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author'] }],
      group: ['bookId', 'book.id'],
      order: [[fn('COUNT', col('Loan.id')), 'DESC']],
      limit: 5,
    });

    return res.json({
      totals: {
        books: totalBooks,
        readers: totalReaders,
        activeReaders,
        totalCopies: Number(totalCopiesRow?.total || 0),
        availableCopies: Number(availableCopiesRow?.total || 0),
        loansOpen: statusCounts.aberto,
        loansReturned: statusCounts.devolvido,
        loansOverdue: statusCounts.atrasado,
      },
      loansByStatus: statusCounts,
      topBorrowed: topBorrowed.map((row) => ({
        bookId: row.bookId,
        title: row.book?.title,
        author: row.book?.author,
        total: Number(row.get('total')),
      })),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { dashboard };
