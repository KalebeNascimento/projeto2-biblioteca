const { Op } = require('sequelize');
const { sequelize, Loan, Reader, Book, User } = require('../models');
const { parsePagination, buildMeta } = require('../utils/pagination');

const DEFAULT_LOAN_DAYS = 14;

const includeDetails = [
  { model: Reader, as: 'reader', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
  { model: Book, as: 'book' },
];

async function markOverdueLoans() {
  const today = new Date().toISOString().slice(0, 10);
  await Loan.update(
    { status: 'atrasado' },
    { where: { status: 'aberto', dueDate: { [Op.lt]: today } } }
  );
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

async function getReaderIdForUser(userId) {
  const reader = await Reader.findOne({ where: { userId } });
  return reader ? reader.id : null;
}

async function list(req, res, next) {
  try {
    await markOverdueLoans();

    const { status, readerId, from, to } = req.query;
    const where = {};

    if (req.user.role === 'leitor') {
      const myReaderId = await getReaderIdForUser(req.user.id);
      where.readerId = myReaderId || 0;
    } else if (readerId) {
      where.readerId = readerId;
    }

    if (status) where.status = status;
    if (from || to) {
      where.loanDate = {};
      if (from) where.loanDate[Op.gte] = from;
      if (to) where.loanDate[Op.lte] = to;
    }

    const { page, pageSize, limit, offset } = parsePagination(req.query);
    const { rows, count } = await Loan.findAndCountAll({
      where,
      include: includeDetails,
      order: [['id', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return res.json({ data: rows, meta: buildMeta({ page, pageSize, total: count }) });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    await markOverdueLoans();

    const loan = await Loan.findByPk(req.params.id, { include: includeDetails });
    if (!loan) return res.status(404).json({ message: 'Empréstimo não encontrado.' });

    if (req.user.role === 'leitor') {
      const myReaderId = await getReaderIdForUser(req.user.id);
      if (loan.readerId !== myReaderId) {
        return res.status(403).json({ message: 'Você só pode consultar seus próprios empréstimos.' });
      }
    }

    return res.json(loan);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { readerId, bookId, bookIds, dueDate } = req.body;
    const ids = bookIds && Array.isArray(bookIds) ? bookIds : bookId ? [bookId] : [];

    if (!readerId || ids.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'readerId e bookId (ou bookIds) são obrigatórios.' });
    }

    const reader = await Reader.findByPk(readerId, { transaction: t });
    if (!reader) {
      await t.rollback();
      return res.status(404).json({ message: 'Leitor não encontrado.' });
    }
    if (reader.status !== 'ativo') {
      await t.rollback();
      return res.status(400).json({ message: 'Leitor inativo não pode realizar empréstimo.' });
    }

    const loanDate = new Date().toISOString().slice(0, 10);
    const finalDueDate = dueDate || addDays(loanDate, DEFAULT_LOAN_DAYS);
    const createdLoans = [];

    for (const id of ids) {
      const book = await Book.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!book) {
        await t.rollback();
        return res.status(404).json({ message: `Livro ${id} não encontrado.` });
      }
      if (book.availableQuantity < 1) {
        await t.rollback();
        return res.status(400).json({ message: `Livro "${book.title}" não possui exemplares disponíveis.` });
      }

      book.availableQuantity -= 1;
      await book.save({ transaction: t });

      const loan = await Loan.create(
        { readerId, bookId: id, loanDate, dueDate: finalDueDate, status: 'aberto' },
        { transaction: t }
      );
      createdLoans.push(loan.id);
    }

    await t.commit();

    const result = await Loan.findAll({ where: { id: createdLoans }, include: includeDetails });
    return res.status(201).json(result.length === 1 ? result[0] : result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
}

async function returnLoan(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const loan = await Loan.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!loan) {
      await t.rollback();
      return res.status(404).json({ message: 'Empréstimo não encontrado.' });
    }
    if (loan.status === 'devolvido') {
      await t.rollback();
      return res.status(400).json({ message: 'Este empréstimo já foi devolvido.' });
    }

    loan.status = 'devolvido';
    loan.returnDate = new Date().toISOString().slice(0, 10);
    await loan.save({ transaction: t });

    const book = await Book.findByPk(loan.bookId, { transaction: t, lock: t.LOCK.UPDATE });
    book.availableQuantity += 1;
    if (book.availableQuantity > book.totalQuantity) book.availableQuantity = book.totalQuantity;
    await book.save({ transaction: t });

    await t.commit();

    const result = await Loan.findByPk(loan.id, { include: includeDetails });
    return res.json(result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
}

module.exports = { list, getById, create, returnLoan };
