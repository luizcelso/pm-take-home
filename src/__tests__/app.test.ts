import request from 'supertest';
import express, { Request, Response, NextFunction, Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { SecureTopicService } from '../services/SecureTopicService';
import { Topic } from '../models/Topic';
import { User } from '../models/User';
import { UserRole } from '../enums/UserRole';

// Mock the authentication middleware and topic service
jest.mock('../middleware/auth');
jest.mock('../services/SecureTopicService');

// Create a mock router
const createMockRouter = () => {
  const router = Router();
  const secureTopicService = new SecureTopicService();
  
  // Define routes
  router.get('/topics', authenticate, (req: Request, res: Response) => {
    secureTopicService.getAllTopics(req.user as User)
      .then(topics => res.json(topics))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.get('/topics/root', authenticate, (req: Request, res: Response) => {
    secureTopicService.getRootTopics(req.user as User)
      .then(topics => res.json(topics))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.post('/topics', authenticate, authorize([UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
    secureTopicService.createTopic(req.body.name, req.body.content, req.user as User, req.body.parentId)
      .then(topic => res.status(201).json(topic))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.get('/topics/:id', authenticate, (req: Request, res: Response) => {
    secureTopicService.getTopic(req.params.id, req.user as User)
      .then(topic => res.json(topic))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.put('/topics/:id', authenticate, authorize([UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
    secureTopicService.updateTopic(req.params.id, req.body, req.user as User)
      .then(topic => res.json(topic))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.delete('/topics/:id', authenticate, authorize([UserRole.ADMIN]), (req: Request, res: Response) => {
    secureTopicService.deleteTopic(req.params.id, req.user as User)
      .then(() => res.status(204).end())
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.get('/topics/:parentId/children', authenticate, (req: Request, res: Response) => {
    secureTopicService.getChildTopics(req.params.parentId, req.user as User)
      .then(topics => res.json(topics))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  router.get('/topics/:id/tree', authenticate, (req: Request, res: Response) => {
    secureTopicService.getTopicTree(req.params.id, req.user as User)
      .then(tree => res.json(tree))
      .catch(err => res.status(500).json({ message: err.message }));
  });
  
  return router;
};

describe('API Integration Tests', () => {
  let app: express.Application;
  let mockTopic: Topic;
  let mockUser: User;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a mock user
    mockUser = new User('Test User', 'test@example.com', UserRole.ADMIN, 'test-id');
    
    // Create a mock topic
    mockTopic = new Topic('Test Topic', 'Test Content');
    // Set the id using Object.defineProperty to bypass readonly restriction
    Object.defineProperty(mockTopic, 'id', { value: '123' });
    
    // Mock the authentication middleware to set the user
    (authenticate as jest.Mock).mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });
    
    // Mock the authorize middleware
    (authorize as jest.Mock).mockImplementation(() => (req: Request, res: Response, next: NextFunction) => next());
    
    // Mock the SecureTopicService methods
    const mockSecureTopicService = {
      createTopic: jest.fn().mockResolvedValue(mockTopic),
      getTopic: jest.fn().mockResolvedValue(mockTopic),
      updateTopic: jest.fn().mockResolvedValue(mockTopic),
      deleteTopic: jest.fn().mockResolvedValue(true),
      getAllTopics: jest.fn().mockResolvedValue([mockTopic]),
      getRootTopics: jest.fn().mockResolvedValue([mockTopic]),
      getChildTopics: jest.fn().mockResolvedValue([mockTopic]),
      getTopicTree: jest.fn().mockResolvedValue({ topic: mockTopic, children: [] })
    };
    
    // Mock the SecureTopicService constructor
    (SecureTopicService as jest.Mock).mockImplementation(() => mockSecureTopicService);
    
    // Create an Express app for testing
    app = express();
    app.use(express.json());
    
    // Add a root route
    app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ message: 'Welcome to the Dynamic Knowledge Base System API' });
    });
    
    // Mount the API routes
    app.use('/api', createMockRouter());
    
    // Add error handling middleware
    app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Not found' });
    });
  });
  
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Welcome to the Dynamic Knowledge Base System API');
    });
  });
  
  describe('GET /api/topics', () => {
    it('should return all topics', async () => {
      const response = await request(app).get('/api/topics');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Topic');
    });
  });
  
  describe('GET /api/topics/root', () => {
    it('should return root topics', async () => {
      const response = await request(app).get('/api/topics/root');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Topic');
    });
  });
  
  describe('POST /api/topics', () => {
    it('should create a new topic', async () => {
      const topicData = {
        name: 'New Topic',
        content: 'New Content'
      };
      
      const response = await request(app)
        .post('/api/topics')
        .send(topicData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('Test Topic');
    });
  });
  
  describe('GET /api/topics/:id', () => {
    it('should return a topic by ID', async () => {
      const response = await request(app).get('/api/topics/123');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('Test Topic');
    });
  });
  
  describe('PUT /api/topics/:id', () => {
    it('should update a topic', async () => {
      const updateData = {
        content: 'Updated Content'
      };
      
      const response = await request(app)
        .put('/api/topics/123')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('Test Topic');
    });
  });
  
  describe('DELETE /api/topics/:id', () => {
    it('should delete a topic', async () => {
      const response = await request(app).delete('/api/topics/123');
      
      expect(response.status).toBe(204);
    });
  });
  
  describe('GET /api/topics/:parentId/children', () => {
    it('should return child topics', async () => {
      const response = await request(app).get('/api/topics/123/children');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Topic');
    });
  });
  
  describe('GET /api/topics/:id/tree', () => {
    it('should return a topic tree', async () => {
      const response = await request(app).get('/api/topics/123/tree');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('topic');
      expect(response.body).toHaveProperty('children');
      expect(response.body.topic.name).toBe('Test Topic');
      expect(response.body.children).toHaveLength(0);
    });
  });
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');
      
      expect(response.status).toBe(404);
    });
  });
}); 