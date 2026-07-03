const request = require('supertest');
const { app, db, resetDatabase, seedUsers } = require('./setup');

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await resetDatabase();
    await seedUsers();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('retorna token e dados do usuário com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('administrador');
  });

  test('retorna 401 com senha errada', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'errado' });

    expect(res.status).toBe(401);
  });

  test('retorna 400 sem email/senha', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  test('rota protegida sem token retorna 401', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(401);
  });
});
