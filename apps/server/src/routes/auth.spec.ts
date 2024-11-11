import request from 'supertest';
import { sessionRepository, userRepository } from '../database';
import { Session, User } from '@qa-assessment/shared';
import bcrypt from 'bcrypt';
import { makeExpressApp } from '../lib';

describe('Authentication', () => {
  const app = makeExpressApp();
  let mockUser: User;
  let mockSession: Session;
  const currentDate = new Date();

  beforeEach(() => {
    // Mock user data
    mockUser = {
      id: '1',
      username: 'testuser',
      password: bcrypt.hashSync('password123', 10),
    };

    mockSession = {
      id: '1',
      userId: mockUser.id,
      token: 'test-session-token',
      createdAt: currentDate,
    };

    // Mock repository methods
    jest
      .spyOn(userRepository, 'findByCredentials')
      .mockImplementation(async ({ username, password }) => {
        if (
          username === mockUser.username &&
          bcrypt.compareSync(password, mockUser.password)
        ) {
          return mockUser;
        }
        return null;
      });

    jest.spyOn(sessionRepository, 'create').mockResolvedValue(mockSession);
    jest
      .spyOn(sessionRepository, 'findByToken')
      .mockImplementation(async (token) =>
        token === mockSession.token ? mockSession : null,
      );
    jest.spyOn(sessionRepository, 'delete').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockSession,
        createdAt: currentDate.toISOString(),
      });
      expect(userRepository.findByCredentials).toHaveBeenCalledTimes(1);
      expect(sessionRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({ message: 'Invalid credentials' });
      expect(userRepository.findByCredentials).toHaveBeenCalledTimes(1);
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'test', // username too short
        password: '123', // password too short
      });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully logout with valid session token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logged out' });
      expect(sessionRepository.findByToken).toHaveBeenCalledWith(
        mockSession.token,
      );
      expect(sessionRepository.delete).toHaveBeenCalledWith(mockSession.id);
    });

    it('should reject logout without authorization header', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
      expect(sessionRepository.delete).not.toHaveBeenCalled();
    });

    it('should reject logout with invalid session token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
      expect(sessionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should validate username length', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'ab', // too short
        password: 'validpassword123',
      });

      expect(response.status).toBe(422);
      expect(response.body.errors[0].message).toContain(
        'String must contain at least 3 character(s)',
      );
    });

    it('should validate password length', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'validuser',
        password: '123', // too short
      });

      expect(response.status).toBe(422);
      expect(response.body.errors[0].message).toContain(
        'String must contain at least 8 character(s)',
      );
    });

    it('should require both username and password', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'testuser',
        // missing password
      });

      expect(response.status).toBe(422);
      expect(response.body.errors[0].message).toContain('Required');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(userRepository, 'findByCredentials')
        .mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal server error' });
    });

    it('should handle session creation errors', async () => {
      jest
        .spyOn(sessionRepository, 'create')
        .mockRejectedValue(new Error('Session creation failed'));

      const response = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal server error' });
    });
  });

  //Start of qa-assessment

  //Test #1
  /*La prueba falla porque la lógca del programa actual no valida los nombres de usuario reservados. 
  Probando manualmente, el programa nos permite registrar y/o crear los usuarios con nombres reservados del sistema 'admin', 'root', 'superuser' cuando no debería ser así.
  */

  describe('Reserved Username Validation', () => {
    it('should reject registration if username is reserved', async () => {
      const reservedUsernames = ['admin', 'root', 'superuser'];

      for (const username of reservedUsernames) {
        const response = await request(app).post('/users').send({
          username: username,
          password: 'validpassword123',
        });

        expect(response.status).toBe(422);
        expect(response.body.errors[0].message).toContain(
          'Username is reserved and cannot be used',
        );
      }
    });
  });

  //Test #2
  describe('Multiple Login Attempts with the Same User', () => {
    it('should reuse the same session token for multiple login attempts with the same user', async () => {
      // Primer inicio de sesión
      const firstLogin = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(firstLogin.status).toBe(200);
      const firstToken = firstLogin.body.token;

      // Segundo inicio de sesión con el mismo usuario
      const secondLogin = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(secondLogin.status).toBe(200);
      const secondToken = secondLogin.body.token;

      // Verifica si el token es el mismo en ambos intentos
      expect(firstToken).toBe(secondToken);
    });
  });

  //Test #3
  describe('Access Protected Route without Authentication', () => {
    it('should deny access to protected route if no token is provided', async () => {
      const response = await request(app).get('/posts');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });

  //Test #4
  /* En este conjunto de pruebas verificamoss el comportamiento del endpoint de logout (/auth/logout) bajo el mismo 'describe' 
  ya que ambos evalúan la misma funcionalidad: el cierre de sesión (logout).
 */

  describe('Logout Endpoint Tests', () => {
    it('should allow logout with a valid token', async () => {
      // Simula un token de sesión válido (creado hoy)
      const validSession = {
        ...mockSession,
        createdAt: new Date(), // Token creado hoy, simulando que aún es válido
      };

      jest
        .spyOn(sessionRepository, 'findByToken')
        .mockResolvedValue(validSession);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', validSession.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logged out' });
    });

    it('should reject logout with an expired token', async () => {
      // Simula un token de sesión expirado
      const expiredSession = {
        ...mockSession,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Token creado hace 1 día, simulando expiración
      };

      jest
        .spyOn(sessionRepository, 'findByToken')
        .mockResolvedValue(expiredSession);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', expiredSession.token);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Session expired' });
    });
  });

  //Test #5
  describe('Login with Incorrect Password', () => {
    it('should reject login if password is incorrect', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword', // Contraseña incorrecta
      });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });
  });
});
