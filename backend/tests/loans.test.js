const request = require('supertest');
const { app, db, resetDatabase, seedUsers, seedBook } = require('./setup');

async function loginAs(email) {
  const { body } = await request(app).post('/api/auth/login').send({ email, password: 'senha123' });
  return body.token;
}

describe('Empréstimos e devoluções', () => {
  let libToken;
  let readerToken;
  let reader;
  let book;

  beforeAll(async () => {
    await resetDatabase();
    const seeded = await seedUsers();
    reader = seeded.reader;
    book = await seedBook({ totalQuantity: 1, availableQuantity: 1, isbn: 'ISBN-LOAN-TEST' });
    libToken = await loginAs('lib@test.com');
    readerToken = await loginAs('reader@test.com');
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('bibliotecário registra empréstimo e livro fica indisponível', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${libToken}`)
      .send({ readerId: reader.id, bookId: book.id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('aberto');
    expect(res.body.book.availableQuantity).toBe(0);
    expect(res.body.book.status).toBe('indisponivel');
  });

  test('não permite empréstimo sem exemplares disponíveis', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${libToken}`)
      .send({ readerId: reader.id, bookId: book.id });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/n(a|ã)o possui exemplares/i);
  });

  test('leitor só vê os próprios empréstimos', async () => {
    const res = await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${readerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((l) => l.readerId === reader.id)).toBe(true);
  });

  test('devolução restaura estoque do livro', async () => {
    const listed = await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${libToken}`);
    const loanId = listed.body.data[0].id;

    const res = await request(app)
      .patch(`/api/loans/${loanId}/return`)
      .set('Authorization', `Bearer ${libToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('devolvido');
    expect(res.body.returnDate).toBeTruthy();
    expect(res.body.book.availableQuantity).toBe(1);
    expect(res.body.book.status).toBe('disponivel');
  });

  test('leitor inativo não pode pegar empréstimo', async () => {
    await db.Reader.update({ status: 'inativo' }, { where: { id: reader.id } });

    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${libToken}`)
      .send({ readerId: reader.id, bookId: book.id });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/inativo/i);
  });
});
