import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { createConnections, getConnection } from 'typeorm';

const app = `http://localhost:${process.env.PORT || 4000}`;

describe('AppController (e2e)', () => {
  const mockBuyerUser = {
    username: 'test',
    role: 'buyer',
  };
  let buyerUserAccesstoken = null;

  const mockSellerUser = {
    username: 'user',
    role: 'seller',
  };
  let sellerUserAccesstoken = null;

  const mockProduct = {
    productName: 'iphone',
    cost: 1,
    amountAvailable: 1,
  };

  const mockUpdateProduct = {
    productName: 'Iphone 13',
    cost: 21,
    amountAvailable: 4,
  };

  let at = null;

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
      .getRepository(Product)
      .query('DELETE FROM products');
    await defaultConnection.manager
      .getRepository(User)
      .query('DELETE FROM users');

    await defaultConnection.close();
  });

  describe('/signup (POST)', () => {
    it('/signup (POST) -> Signup user return accesstoken', async () => {
      const result = await request(app).post('/signup').send({
        username: mockBuyerUser.username,
        password: '123',
        role: mockBuyerUser.role,
      });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      at = result.body.accessToken;
    });

    it('/signup (POST) -> Signup failed username exists', async () => {
      const result = await request(app).post('/signup').send({
        username: mockBuyerUser.username,
        password: '123',
        role: mockBuyerUser.role,
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
      const result = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${at}`);
      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(1);
      expect(result.body[0]).toHaveProperty('id', expect.any(String));
      expect(result.body[0]).toHaveProperty('deposit', 0);
      expect(result.body[0]).toHaveProperty('username', 'test');
      expect(result.body[0]).toHaveProperty('role', 'buyer');
      userId = result.body[0].id;
    });

    it('/users/:id (GET) -> returns one user by id', async () => {
      const result = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${at}`);
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
      const result = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

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
      const result = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

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

  describe('products (GET)', () => {
    it('/products (GET) -> should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('/products/:id (GET) -> product not found', async () => {
      const response = await request(app).get(
        '/products/c0dcf6b3-0cd6-4fe6-924e-7e27ae75ee19',
      );
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Product not found',
      });
    });
  });

  describe('/signup (POST)', () => {
    it('/signup (POST) -> register buyer users', async () => {
      const buyerUser = await request(app).post('/signup').send({
        username: mockBuyerUser.username,
        password: '123',
        role: mockBuyerUser.role,
      });

      expect(buyerUser.status).toBe(200);
      expect(buyerUser.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      buyerUserAccesstoken = buyerUser.body.accessToken;
    });

    it('/signup (POST) -> register seller users', async () => {
      const sellerUser = await request(app).post('/signup').send({
        username: mockSellerUser.username,
        password: '123',
        role: mockSellerUser.role,
      });

      expect(sellerUser.status).toBe(200);
      expect(sellerUser.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      sellerUserAccesstoken = sellerUser.body.accessToken;
    });

    it('/deposit (POST) -> deposit money 100', async () => {
      const result = await await request(app)
        .post(`/deposit`)
        .send({
          amount: 100,
        })
        .set({ Authorization: `Bearer ${buyerUserAccesstoken}` });
      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('deposit', 100);
    });

    it('/deposit (POST) -> deposit money 20', async () => {
      const result = await await request(app)
        .post(`/deposit`)
        .send({
          amount: 20,
        })
        .set({ Authorization: `Bearer ${buyerUserAccesstoken}` });
      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('deposit', 120);
    });
  });

  describe('/products (POST)', () => {
    it('/products (POST) -> should not create a new product', async () => {
      const product = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${buyerUserAccesstoken}`)
        .send(mockProduct);

      expect(product.body.statusCode).toBe(401);
      expect(product.body.error).toEqual('Unauthorized');
    });

    it('/products (POST) -> should create a new product', async () => {
      const product = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${sellerUserAccesstoken}`)
        .send(mockProduct);

      expect(product.status).toBe(201);
      expect(product.body).toEqual({
        ...mockProduct,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        sellerId: expect.any(String),
      });
    });
  });

  describe('/products/:id (UPDATE)', () => {
    let productId = null;
    it('/products (GET) -> should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      productId = response.body[0].id;
    });

    it('/products (UPDATE) -> should throw unauthorized error', async () => {
      const product = await request(app)
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${buyerUserAccesstoken}`)
        .send(mockUpdateProduct);
      expect(product.body.statusCode).toBe(401);
      expect(product.body.error).toEqual('Unauthorized');
    });

    it('/products (UPDATE) -> should update the product', async () => {
      const product = await request(app)
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${sellerUserAccesstoken}`)
        .send(mockUpdateProduct);

      expect(product.status).toBe(200);
      expect(product.body).toEqual({
        ...mockUpdateProduct,
        id: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('/buy (POST)', () => {
    let productId = null;
    it('/products (GET) -> should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      productId = response.body[0].id;
    });

    it('/buy (POST) -> should throw unauthorized error', async () => {
      const response = await request(app).post('/buy').send({
        productId,
        quantity: 4,
      });
      expect(response.body.statusCode).toBe(401);
      expect(response.body.error).toEqual('Unauthorized');
    });

    it('/buy (POST) -> should return error not enough money', async () => {
      const response = await request(app)
        .post('/buy')
        .send({
          productId,
          quantity: 10,
        })
        .set('Authorization', `Bearer ${buyerUserAccesstoken}`);
      expect(response.body.error).toBe(
        'You do not have enough money to buy this product or this quantity',
      );
    });

    it('/buy (POST) -> should buy 3 products', async () => {
      const response = await request(app)
        .post('/buy')
        .send({
          productId,
          quantity: 3,
        })
        .set('Authorization', `Bearer ${buyerUserAccesstoken}`);
      expect(response.status).toBe(200);
      expect(response.body.totalSpent).toBe(63);
      expect(response.body.productsPurchased).toBe(3);
      expect(response.body.change).toEqual([
        { coin: 100, amount: 0 },
        { coin: 50, amount: 1 },
        { coin: 20, amount: 0 },
        { coin: 10, amount: 0 },
        { coin: 5, amount: 1 },
        { coin: 1, amount: 2 },
      ]);
    });

    it('/buy (POST) -> should return error not enough money', async () => {
      const response = await request(app)
        .post('/buy')
        .send({
          productId,
          quantity: 2,
        })
        .set('Authorization', `Bearer ${buyerUserAccesstoken}`);
      expect(response.body.error).toEqual('Not enough quantity!');
    });
  });
});
