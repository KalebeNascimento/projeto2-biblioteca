require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const bcrypt = require('bcryptjs');
const app = require('../src/app');
const db = require('../src/models');

async function resetDatabase() {
  await db.sequelize.sync({ force: true });
}

async function seedUsers() {
  const password = await bcrypt.hash('senha123', 10);
  const admin = await db.User.create({
    name: 'Admin Teste',
    email: 'admin@test.com',
    password,
    role: 'administrador',
  });
  const librarian = await db.User.create({
    name: 'Bibliotecario Teste',
    email: 'lib@test.com',
    password,
    role: 'bibliotecario',
  });
  const readerUser = await db.User.create({
    name: 'Leitor Teste',
    email: 'reader@test.com',
    password,
    role: 'leitor',
  });
  const reader = await db.Reader.create({
    userId: readerUser.id,
    cpfRa: '99999999999',
    phone: '(11) 99999-9999',
    address: 'Rua Teste, 1',
    status: 'ativo',
  });

  return { admin, librarian, readerUser, reader };
}

async function seedBook(overrides = {}) {
  return db.Book.create({
    title: 'Livro Teste',
    author: 'Autor',
    publisher: 'Editora',
    publicationYear: 2020,
    category: 'Teste',
    isbn: `ISBN-${Date.now()}-${Math.random()}`,
    totalQuantity: 2,
    availableQuantity: 2,
    ...overrides,
  });
}

module.exports = { app, db, resetDatabase, seedUsers, seedBook };
