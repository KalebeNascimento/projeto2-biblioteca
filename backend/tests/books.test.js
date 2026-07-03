const request = require('supertest');
const { app, db, resetDatabase, seedUsers } = require('./setup');

async function loginAs(email) {
  const { body } = await request(app).post('/api/auth/login').send({ email, password: 'senha123' });
  return body.token;
}

describe('CRUD e RBAC de livros', () => {
  let adminToken;
  let readerToken;

  beforeAll(async () => {
    await resetDatabase();
    await seedUsers();
    adminToken = await loginAs('admin@test.com');
    readerToken = await loginAs('reader@test.com');
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('admin cria um livro', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Livro A',
        author: 'Autor',
        publisher: 'Editora',
        publicationYear: 2024,
        category: 'Tecnologia',
        isbn: '978-BOOK-A',
        totalQuantity: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.availableQuantity).toBe(3);
    expect(res.body.status).toBe('disponivel');
  });

  test('leitor NÃO pode criar livro (403)', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${readerToken}`)
      .send({
        title: 'X',
        author: 'Y',
        publisher: 'Z',
        publicationYear: 2020,
        category: 'C',
        isbn: '000',
        totalQuantity: 1,
      });
    expect(res.status).toBe(403);
  });

  test('lista livros com paginação (data + meta)', async () => {
    const res = await request(app)
      .get('/api/books?page=1&pageSize=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toEqual(
      expect.objectContaining({ page: 1, pageSize: 5 })
    );
  });

  test('filtro por título faz busca case-insensitive', async () => {
    const res = await request(app)
      .get('/api/books?title=livro%20a')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((b) => b.title === 'Livro A')).toBe(true);
  });
});
