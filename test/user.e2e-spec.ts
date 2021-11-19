import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { createConnections, getConnection } from 'typeorm';

const app = `http://localhost:${process.env.PORT || 4000}`;

describe('UserController (e2e)', () => {
  const mockUsers = {
    username: 'test',
    role: 'buyer',
  };

  beforeAll(async () => {
    await createConnections([
      {
        type: 'postgres',
        host: process.env.HOST,
        port: parseInt(process.env.PG_PORT),
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: 'vending_machine_test',
        entities: [User, Product],
        migrationsTableName: 'db_migrations',
        migrations: ['migration/*.js'],
        cli: {
          migrationsDir: 'migration',
        },
      },
    ]);
  });

  afterAll(async () => {
    const defaultConnection = getConnection();
    // delete records
    await defaultConnection.manager
      .getRepository(User)
      .query('DELETE FROM users');
    await defaultConnection.manager
      .getRepository(Product)
      .query('DELETE FROM products');
    await defaultConnection.close();
  });

  it('/users (GET) -> return empty array', async () => {
    const result = await request(app).get('/users');

    expect(result.status).toBe(200);
    expect(result.body).toEqual([]);
  });

  describe('/signup (POST)', () => {
    it('/signup (POST) -> Signup user return accesstoken', async () => {
      const result = await request(app).post('/signup').send({
        username: mockUsers.username,
        password: '123',
        role: mockUsers.role,
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('/signup (POST) -> Signup failed username exists', async () => {
      const result = await request(app).post('/signup').send({
        username: mockUsers.username,
        password: '123',
        role: mockUsers.role,
      });

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'username is already used!',
      });
    });
  });

  describe('users (GET)', () => {
    let userId = null;
    it('/users (GET) -> returns all users', async () => {
      const result = await request(app).get('/users');

      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(1);
      expect(result.body[0]).toHaveProperty('id', expect.any(String));
      expect(result.body[0]).toHaveProperty('deposit', 0);
      expect(result.body[0]).toHaveProperty('username', 'test');
      expect(result.body[0]).toHaveProperty('role', 'buyer');
      userId = result.body[0].id;
    });

    it('/users/:id (GET) -> returns one user by id', async () => {
      const result = await request(app).get(`/users/${userId}`);
      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('id', userId);
      expect(result.body).toHaveProperty('deposit', 0);
      expect(result.body).toHaveProperty('username', 'test');
      expect(result.body).toHaveProperty('role', 'buyer');
    });
  });

  describe('/login (POST)', () => {
    let rf = null;
    it('/login (POST) -> login user returns accesstoken', async () => {
      const result = await request(app).post('/login').send({
        username: 'test',
        password: '123',
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      rf = result.body.refreshToken;
    });

    it('/rf (POST) -> refresh token returns accesstoken', async () => {
      const result = await request(app).post('/rf').send({
        token: rf,
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('/login (POST) -> user not found', async () => {
      const result = await request(app).post('/login').send({
        username: 'test2',
        password: '123',
      });

      expect(result.status).toBe(404);
      expect(result.body).toEqual({
        error: 'user not found!',
      });
    });

    it('/login (POST) -> invalid password', async () => {
      const result = await request(app).post('/login').send({
        username: 'test',
        password: '1233',
      });

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'Invalid credentials!',
      });
    });
  });

  describe('/update/:id (PATCH)', () => {
    let userId = null;
    let accessToken = null;
    it('/login (POST) -> login user returns accesstoken', async () => {
      const result = await request(app).post('/login').send({
        username: 'test',
        password: '123',
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      accessToken = result.body.accessToken;
    });

    it('/users (GET) -> returns all users', async () => {
      const result = await request(app).get('/users');

      expect(result.status).toBe(200);
      userId = result.body[0].id;
    });

    it('/users (PATCH) -> update user', async () => {
      const result = await await request(app)
        .patch(`/users/${userId}`)
        .send({
          username: 'test V2',
        })
        .set({ Authorization: `Bearer ${accessToken}` });

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('username', 'test V2');
    });
  });

  describe('/deposit (POST)', () => {
    let accessToken = null;
    it('/login (POST) -> login user returns accesstoken', async () => {
      const result = await request(app).post('/login').send({
        username: 'test V2',
        password: '123',
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      accessToken = result.body.accessToken;
    });

    it('/deposit (POST) -> deposit money', async () => {
      const result = await await request(app)
        .post(`/deposit`)
        .send({
          amount: 100,
        })
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('deposit', 100);
    });
  });

  describe('/reset (POST)', () => {
    let accessToken = null;
    it('/login (POST) -> login user returns accesstoken', async () => {
      const result = await request(app).post('/login').send({
        username: 'test V2',
        password: '123',
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      accessToken = result.body.accessToken;
    });

    it('/reset (POST) -> reset money to 0', async () => {
      const result = await await request(app)
        .post(`/reset`)
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('deposit', 0);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let accessToken = null;
    let userId = null;
    it('/login (POST) -> login user returns accesstoken', async () => {
      const result = await request(app).post('/login').send({
        username: 'test V2',
        password: '123',
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      accessToken = result.body.accessToken;
    });

    it('/users (GET) -> returns all users', async () => {
      const result = await request(app).get('/users');

      expect(result.status).toBe(200);
      userId = result.body[0].id;
    });

    it('/users/:id (DELETE) -> delete user', async () => {
      const result = await request(app)
        .delete(`/users/${userId}`)
        .set({ Authorization: `Bearer ${accessToken}` });

      expect(result.status).toBe(200);
    });
  });
});
