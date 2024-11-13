import axios from 'axios';
import { Post, Session } from '@qa-assessment/shared';

describe('Posts API', () => {
  let authToken: string;
  let userId: string;
  let createdPostId: string; // Definimos aquí createdPostId para que esté disponible en todas las pruebas

  beforeAll(async () => {
    // Register a test user
    const username = `testuser_${Math.random().toString(36).substring(7)}`;
    const password = 'password123';

    const registerResponse = await axios.post<Session>('/users', {
      username,
      password,
    });

    expect(registerResponse.status).toBe(200);
    authToken = registerResponse.data.token;
    userId = registerResponse.data.userId;

    // Configure axios to use the auth token for subsequent requests
    axios.defaults.headers.common['Authorization'] = authToken;
  });

  afterAll(() => {
    // Clean up axios headers
    delete axios.defaults.headers.common['Authorization'];
  });

  describe('POST /posts', () => {
    it('should create a new post successfully', async () => {
      // Prepare test data
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content.',
      };

      // Create post
      const createResponse = await axios.post<Post>('/posts', postData);

      // Verify response status
      expect(createResponse.status).toBe(201);

      // Verify response data
      const createdPost = createResponse.data;
      expect(createdPost).toMatchObject({
        title: postData.title,
        content: postData.content,
        authorId: userId,
      });

      // Verify post properties
      expect(createdPost.id).toBeDefined();
      expect(createdPost.createdAt).toBeDefined();
      expect(createdPost.updatedAt).toBeDefined();

      // Verify we can fetch the created post
      const getResponse = await axios.get<Post>(`/posts/${createdPost.id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toEqual(createdPost);
    });

    it('should reject post creation with invalid data', async () => {
      // Test with empty title
      const invalidPost = {
        title: '',
        content: 'Test content',
      };

      try {
        await axios.post('/posts', invalidPost);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.errors).toBeDefined();
      }
    });

    it('should reject unauthorized post creation', async () => {
      // Remove auth token
      delete axios.defaults.headers.common['Authorization'];

      try {
        await axios.post('/posts', {
          title: 'Unauthorized Post',
          content: 'This should fail',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      // Restore auth token for subsequent tests
      axios.defaults.headers.common['Authorization'] = authToken;
    });
  });

  //Start Of Qa Assessment
  //Test #1
  describe('POST and PUT /posts', () => {
    it('should create and then update a post', async () => {
      // Crear el post
      const postData = {
        title: 'Post de Prueba para Actualización',
        content: 'Este es el contenido original del post.',
      };

      const createResponse = await axios.post<Post>('/posts', postData);
      expect(createResponse.status).toBe(201);

      const createdPost = createResponse.data;
      expect(createdPost).toMatchObject({
        title: postData.title,
        content: postData.content,
        authorId: userId,
      });

      const createdPostId = createdPost.id;

      // Actualizar el post
      const updateData = {
        title: 'Post Actualizado',
        content: 'Este es el contenido actualizado del post.',
      };

      const updateResponse = await axios.put<Post>(
        `/posts/${createdPostId}`,
        updateData,
      );
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toMatchObject(updateData);

      // Verificar que el post fue actualizado
      const getResponse = await axios.get<Post>(`/posts/${createdPostId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toMatchObject(updateData);
    });
  });

  //Test #2
  describe('GET /posts/:postId', () => {
    it('should retrieve a post by ID', async () => {
      // Crear un post para obtener su ID
      const postData = {
        title: 'Post para obtener por ID',
        content: 'Este contenido será verificado.',
      };

      const createResponse = await axios.post<Post>('/posts', postData);
      expect(createResponse.status).toBe(201);

      const createdPostId = createResponse.data.id;

      // Obtener el post creado
      const getResponse = await axios.get<Post>(`/posts/${createdPostId}`);
      expect(getResponse.status).toBe(200);
      console.log(createdPostId);
      expect(getResponse.data).toMatchObject(postData);
    });

    it('should return 404 for a non-existent post ID', async () => {
      try {
        await axios.get<Post>('/posts/nonexistentId');
        fail('Expected error not thrown');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('message', 'Post not found');
      }
    });
  });

  //Test #3
  describe('DELETE /posts/:postId', () => {
    it('should delete a post by ID', async () => {
      // Creaamos un post y luego lo eliminamos
      const postData = {
        title: 'Post para eliminación',
        content: 'Este post será eliminado.',
      };

      const createResponse = await axios.post<Post>('/posts', postData);
      expect(createResponse.status).toBe(201);

      const createdPostId = createResponse.data.id;

      // Eliminar el post creado
      const deleteResponse = await axios.delete(`/posts/${createdPostId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data).toHaveProperty('message', 'Post deleted');

      // Verificar que el post ya no existe
      try {
        await axios.get<Post>(`/posts/${createdPostId}`);
        fail('Expected error not thrown');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('message', 'Post not found');
      }
    });
  });
});
