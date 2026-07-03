const { Op } = require('sequelize');
const { Book } = require('../models');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    const { title, author, category, isbn, available } = req.query;
    const where = {};

    if (title) where.title = { [Op.iLike]: `%${title}%` };
    if (author) where.author = { [Op.iLike]: `%${author}%` };
    if (category) where.category = { [Op.iLike]: `%${category}%` };
    if (isbn) where.isbn = { [Op.iLike]: `%${isbn}%` };
    if (available !== undefined) {
      where.status = available === 'true' ? 'disponivel' : 'indisponivel';
    }

    const { page, pageSize, limit, offset } = parsePagination(req.query);
    const { rows, count } = await Book.findAndCountAll({
      where,
      order: [['title', 'ASC']],
      limit,
      offset,
    });

    return res.json({ data: rows, meta: buildMeta({ page, pageSize, total: count }) });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });
    return res.json(book);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, author, publisher, publicationYear, category, isbn, totalQuantity } = req.body;
    if (!title || !author || !publisher || !publicationYear || !category || !isbn || totalQuantity === undefined) {
      return res.status(400).json({ message: 'Todos os campos do livro são obrigatórios.' });
    }

    const book = await Book.create({
      title,
      author,
      publisher,
      publicationYear,
      category,
      isbn,
      totalQuantity,
      availableQuantity: totalQuantity,
    });

    return res.status(201).json(book);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });

    const { title, author, publisher, publicationYear, category, isbn, totalQuantity, availableQuantity } = req.body;

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (publisher !== undefined) book.publisher = publisher;
    if (publicationYear !== undefined) book.publicationYear = publicationYear;
    if (category !== undefined) book.category = category;
    if (isbn !== undefined) book.isbn = isbn;

    if (totalQuantity !== undefined) {
      const loanedCopies = book.totalQuantity - book.availableQuantity;
      if (totalQuantity < loanedCopies) {
        return res.status(400).json({ message: 'Quantidade total não pode ser menor que o número de exemplares emprestados.' });
      }
      book.availableQuantity = totalQuantity - loanedCopies;
      book.totalQuantity = totalQuantity;
    }

    if (availableQuantity !== undefined) book.availableQuantity = availableQuantity;

    await book.save();
    return res.json(book);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });

    await book.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };
