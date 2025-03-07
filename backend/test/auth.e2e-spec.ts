import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Authentication Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockUser = {
    name_business: 'Toko Serba Ada 9',
    email: 'tokoserbaada9@gmail.com',
    phone_number: '08123456785',
    address: 'Jl. Raya, No. 123',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST) - should register a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(mockUser)
      .expect(201);

    expect(response.body).toMatchObject({
      status: 'success',
      message: 'Berhasil signup!',
      data: {
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      },
    });
  });

  it('/auth/signin (POST) - should log in the user and return tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: mockUser.email,
        password: mockUser.password,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'success',
      message: 'Berhasil signin!',
      data: {
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      },
    });

    accessToken = response.body.data.access_token;
    refreshToken = response.body.data.refresh_token;
  });

  it('/auth/profile (GET) - should return the user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'success',
      message: 'Profile berhasil diambil',
      data: {
        id: expect.any(Number),
        name_business: expect.any(String),
        email: expect.any(String),
        phone_number: expect.any(String),
        address: expect.any(String),
        is_deleted: expect.any(Boolean),
        updated_at: expect.any(String),
        created_at: expect.any(String),
      },
    });
  });

  it('/auth/refresh (PUT) - should refresh the tokens', async () => {
    console.log('PRINT REFRESH TOKEN: ', refreshToken);
    const response = await request(app.getHttpServer())
      .put('/auth/refresh')
      .send({
        refreshToken: refreshToken,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'success',
      message: 'Token berhasil diperbarui',
      data: {
        access_token: expect.any(String),
      },
    });

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });
});
