import { Request, Response } from 'express';
import { TopicController } from '../TopicController';
import { SecureTopicService } from '../../services/SecureTopicService';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';
import { Topic } from '../../models/Topic';

// Mock the SecureTopicService
jest.mock('../../services/SecureTopicService');

describe('TopicController', () => {
  let topicController: TopicController;
  let mockTopicService: jest.Mocked<SecureTopicService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: User;
  let mockTopic: Topic;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a mock topic service
    mockTopicService = new SecureTopicService() as jest.Mocked<SecureTopicService>;
    
    // Create a mock user
    mockUser = new User('Test User', 'test@example.com', UserRole.ADMIN, 'test-id');
    
    // Create a mock topic
    mockTopic = new Topic('Test Topic', 'Test Content');
    
    // Create mock request and response objects
    mockRequest = {
      params: {},
      body: {},
      user: mockUser
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    
    // Create the controller with the mock service
    topicController = new TopicController(mockTopicService);
  });
  
  describe('createTopic', () => {
    it('should create a topic successfully', async () => {
      // Arrange
      mockRequest.body = {
        name: 'New Topic',
        content: 'New Content'
      };
      
      mockTopicService.createTopic.mockResolvedValue(mockTopic);
      
      // Act
      await topicController.createTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.createTopic).toHaveBeenCalledWith(
        'New Topic',
        'New Content',
        mockUser,
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopic);
    });
    
    it('should create a child topic successfully', async () => {
      // Arrange
      mockRequest.body = {
        name: 'Child Topic',
        content: 'Child Content',
        parentTopicId: 'parent-id'
      };
      
      mockTopicService.createTopic.mockResolvedValue(mockTopic);
      
      // Act
      await topicController.createTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.createTopic).toHaveBeenCalledWith(
        'Child Topic',
        'Child Content',
        mockUser,
        'parent-id'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopic);
    });
    
    it('should return 400 if name or content is missing', async () => {
      // Arrange
      mockRequest.body = {
        name: 'New Topic'
        // content is missing
      };
      
      // Act
      await topicController.createTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.createTopic).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Name and content are required' });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.body = {
        name: 'New Topic',
        content: 'New Content'
      };
      mockRequest.user = undefined;
      
      // Act
      await topicController.createTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.createTopic).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });
    
    it('should return 403 if user does not have permission', async () => {
      // Arrange
      mockRequest.body = {
        name: 'New Topic',
        content: 'New Content'
      };
      
      const permissionError = new Error('User does not have permission to create topics');
      mockTopicService.createTopic.mockRejectedValue(permissionError);
      
      // Act
      await topicController.createTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.createTopic).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: permissionError.message });
    });
  });
  
  describe('getTopic', () => {
    it('should get a topic successfully', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      
      mockTopicService.getTopic.mockResolvedValue(mockTopic);
      
      // Act
      await topicController.getTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith('topic-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopic);
    });
    
    it('should return 404 if topic is not found', async () => {
      // Arrange
      mockRequest.params = {
        id: 'non-existent-id'
      };
      
      mockTopicService.getTopic.mockResolvedValue(null);
      
      // Act
      await topicController.getTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith('non-existent-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `Topic with ID non-existent-id not found` });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      mockRequest.user = undefined;
      
      // Act
      await topicController.getTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getTopic).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });
  });
  
  describe('updateTopic', () => {
    it('should update a topic successfully', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      mockRequest.body = {
        content: 'Updated Content'
      };
      
      mockTopicService.updateTopic.mockResolvedValue(mockTopic);
      
      // Act
      await topicController.updateTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.updateTopic).toHaveBeenCalledWith(
        'topic-id',
        'Updated Content',
        mockUser,
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopic);
    });
    
    it('should update a topic name successfully', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      mockRequest.body = {
        content: 'Updated Content',
        name: 'Updated Name'
      };
      
      mockTopicService.updateTopic.mockResolvedValue(mockTopic);
      
      // Act
      await topicController.updateTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.updateTopic).toHaveBeenCalledWith(
        'topic-id',
        'Updated Content',
        mockUser,
        'Updated Name'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopic);
    });
    
    it('should return 400 if content is missing', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      mockRequest.body = {
        // content is missing
        name: 'Updated Name'
      };
      
      // Act
      await topicController.updateTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.updateTopic).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Content is required' });
    });
  });
  
  describe('deleteTopic', () => {
    it('should delete a topic successfully', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      
      mockTopicService.deleteTopic.mockResolvedValue(true);
      
      // Act
      await topicController.deleteTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.deleteTopic).toHaveBeenCalledWith('topic-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
    
    it('should return 404 if topic is not found', async () => {
      // Arrange
      mockRequest.params = {
        id: 'non-existent-id'
      };
      
      mockTopicService.deleteTopic.mockResolvedValue(false);
      
      // Act
      await topicController.deleteTopic(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.deleteTopic).toHaveBeenCalledWith('non-existent-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `Topic with ID non-existent-id not found` });
    });
  });
  
  describe('getAllTopics', () => {
    it('should get all topics successfully', async () => {
      // Arrange
      const mockTopics = [mockTopic, new Topic('Another Topic', 'Another Content')];
      mockTopicService.getAllTopics.mockResolvedValue(mockTopics);
      
      // Act
      await topicController.getAllTopics(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getAllTopics).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopics);
    });
  });
  
  describe('getRootTopics', () => {
    it('should get root topics successfully', async () => {
      // Arrange
      const mockTopics = [mockTopic, new Topic('Another Root Topic', 'Another Content')];
      mockTopicService.getRootTopics.mockResolvedValue(mockTopics);
      
      // Act
      await topicController.getRootTopics(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getRootTopics).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopics);
    });
  });
  
  describe('getChildTopics', () => {
    it('should get child topics successfully', async () => {
      // Arrange
      mockRequest.params = {
        parentId: 'parent-id'
      };
      
      const mockTopics = [mockTopic, new Topic('Another Child Topic', 'Another Content')];
      mockTopicService.getChildTopics.mockResolvedValue(mockTopics);
      
      // Act
      await topicController.getChildTopics(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getChildTopics).toHaveBeenCalledWith('parent-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopics);
    });
  });
  
  describe('getTopicTree', () => {
    it('should get topic tree successfully', async () => {
      // Arrange
      mockRequest.params = {
        id: 'topic-id'
      };
      
      const mockTopicTree = {
        topic: mockTopic,
        children: []
      };
      mockTopicService.getTopicTree.mockResolvedValue(mockTopicTree);
      
      // Act
      await topicController.getTopicTree(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getTopicTree).toHaveBeenCalledWith('topic-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTopicTree);
    });
    
    it('should return 404 if topic is not found', async () => {
      // Arrange
      mockRequest.params = {
        id: 'non-existent-id'
      };
      
      mockTopicService.getTopicTree.mockResolvedValue(null);
      
      // Act
      await topicController.getTopicTree(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockTopicService.getTopicTree).toHaveBeenCalledWith('non-existent-id', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: `Topic with ID non-existent-id not found` });
    });
  });
}); 