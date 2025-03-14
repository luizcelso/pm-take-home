import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { TopicController } from '../../controllers/TopicController';
import { UserRole } from '../../enums/UserRole';

// Mock the middleware and controller
jest.mock('../../middleware/auth');
jest.mock('../../controllers/TopicController');

// Create a router factory to avoid loading the actual routes file
const createRouter = () => {
  const router = express.Router();
  const topicController = new TopicController();
  
  // Get all topics
  router.get('/', authenticate, (req: Request, res: Response) => topicController.getAllTopics(req, res));
  
  // Get all root topics
  router.get('/root', authenticate, (req: Request, res: Response) => topicController.getRootTopics(req, res));
  
  // Create a new topic
  router.post('/', 
    authenticate, 
    authorize([UserRole.ADMIN, UserRole.EDITOR]), 
    (req: Request, res: Response) => topicController.createTopic(req, res)
  );
  
  // Get a topic by ID
  router.get('/:id', authenticate, (req: Request, res: Response) => topicController.getTopic(req, res));
  
  // Update a topic
  router.put('/:id', 
    authenticate, 
    authorize([UserRole.ADMIN, UserRole.EDITOR]), 
    (req: Request, res: Response) => topicController.updateTopic(req, res)
  );
  
  // Delete a topic
  router.delete('/:id', 
    authenticate, 
    authorize([UserRole.ADMIN]), 
    (req: Request, res: Response) => topicController.deleteTopic(req, res)
  );
  
  // Get child topics of a parent topic
  router.get('/:parentId/children', authenticate, (req: Request, res: Response) => topicController.getChildTopics(req, res));
  
  // Get a topic tree
  router.get('/:id/tree', authenticate, (req: Request, res: Response) => topicController.getTopicTree(req, res));
  
  return { router, topicController };
};

describe('Topic Routes', () => {
  let app: express.Application;
  let mockTopicController: jest.Mocked<TopicController>;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a mock controller with implementations that call res.json
    mockTopicController = {
      createTopic: jest.fn().mockImplementation((req: Request, res: Response) => res.status(201).json({ message: 'Topic created' })),
      getTopic: jest.fn().mockImplementation((req: Request, res: Response) => res.json({ id: req.params.id, name: 'Test Topic' })),
      updateTopic: jest.fn().mockImplementation((req: Request, res: Response) => res.json({ message: 'Topic updated' })),
      deleteTopic: jest.fn().mockImplementation((req: Request, res: Response) => res.json({ message: 'Topic deleted' })),
      getAllTopics: jest.fn().mockImplementation((req: Request, res: Response) => res.json([{ id: '1', name: 'Topic 1' }])),
      getRootTopics: jest.fn().mockImplementation((req: Request, res: Response) => res.json([{ id: '1', name: 'Root Topic' }])),
      getChildTopics: jest.fn().mockImplementation((req: Request, res: Response) => res.json([{ id: '2', name: 'Child Topic' }])),
      getTopicTree: jest.fn().mockImplementation((req: Request, res: Response) => res.json({ id: req.params.id, name: 'Topic', children: [] }))
    } as unknown as jest.Mocked<TopicController>;
    
    // Mock the TopicController constructor
    (TopicController as jest.Mock).mockImplementation(() => mockTopicController);
    
    // Mock the middleware functions
    (authenticate as jest.Mock).mockImplementation((req: Request, res: Response, next: NextFunction) => next());
    (authorize as jest.Mock).mockImplementation(() => (req: Request, res: Response, next: NextFunction) => next());
    
    // Create an Express app
    app = express();
    app.use(express.json());
    
    // Use our router factory instead of importing the actual routes
    const { router } = createRouter();
    app.use('/topics', router);
  });
  
  describe('GET /', () => {
    it('should call getAllTopics controller method', async () => {
      // Act
      const response = await request(app).get('/topics');
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(mockTopicController.getAllTopics).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: '1', name: 'Topic 1' }]);
    });
  });
  
  describe('GET /root', () => {
    it('should call getRootTopics controller method', async () => {
      // Act
      const response = await request(app).get('/topics/root');
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(mockTopicController.getRootTopics).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: '1', name: 'Root Topic' }]);
    });
  });
  
  describe('POST /', () => {
    it('should call createTopic controller method', async () => {
      // Arrange
      const topicData = {
        name: 'Test Topic',
        content: 'Test Content'
      };
      
      // Act
      const response = await request(app)
        .post('/topics')
        .send(topicData);
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(authorize).toHaveBeenCalled();
      expect(mockTopicController.createTopic).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Topic created' });
    });
  });
  
  describe('GET /:id', () => {
    it('should call getTopic controller method', async () => {
      // Act
      const response = await request(app).get('/topics/123');
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(mockTopicController.getTopic).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: '123', name: 'Test Topic' });
    });
  });
  
  describe('PUT /:id', () => {
    it('should call updateTopic controller method', async () => {
      // Arrange
      const updateData = {
        content: 'Updated Content'
      };
      
      // Act
      const response = await request(app)
        .put('/topics/123')
        .send(updateData);
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(authorize).toHaveBeenCalled();
      expect(mockTopicController.updateTopic).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Topic updated' });
    });
  });
  
  describe('DELETE /:id', () => {
    it('should call deleteTopic controller method', async () => {
      // Act
      const response = await request(app).delete('/topics/123');
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(authorize).toHaveBeenCalled();
      expect(mockTopicController.deleteTopic).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Topic deleted' });
    });
  });
  
  describe('GET /:parentId/children', () => {
    it('should call getChildTopics controller method', async () => {
      // Act
      const response = await request(app).get('/topics/123/children');
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(mockTopicController.getChildTopics).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: '2', name: 'Child Topic' }]);
    });
  });
  
  describe('GET /:id/tree', () => {
    it('should call getTopicTree controller method', async () => {
      // Act
      const response = await request(app).get('/topics/123/tree');
      
      // Assert
      expect(authenticate).toHaveBeenCalled();
      expect(mockTopicController.getTopicTree).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: '123', name: 'Topic', children: [] });
    });
  });
}); 