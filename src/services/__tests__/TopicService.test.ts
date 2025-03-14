import { TopicService } from '../TopicService';
import { TopicRepository } from '../../repositories/TopicRepository';
import { Topic } from '../../models/Topic';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';

// Mock the TopicRepository
jest.mock('../../repositories/TopicRepository');

describe('TopicService', () => {
  let topicService: TopicService;
  let mockTopicRepository: jest.Mocked<TopicRepository>;
  let testUser: User;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a mock TopicRepository
    mockTopicRepository = new TopicRepository() as jest.Mocked<TopicRepository>;
    
    // Create a TopicService with the mock repository
    topicService = new TopicService(mockTopicRepository);
    
    // Create a test user
    testUser = new User('Test User', 'test@example.com', UserRole.ADMIN);
  });
  
  describe('createTopic', () => {
    it('should create a root topic', async () => {
      // Arrange
      const name = 'Test Topic';
      const content = 'Test Content';
      const topic = new Topic(name, content);
      
      mockTopicRepository.create.mockResolvedValue(topic);
      
      // Act
      const result = await topicService.createTopic(name, content, testUser);
      
      // Assert
      expect(mockTopicRepository.create).toHaveBeenCalledWith(expect.any(Topic));
      expect(result).toBe(topic);
      expect(result.name).toBe(name);
      expect(result.content).toBe(content);
    });
    
    it('should create a child topic', async () => {
      // Arrange
      const name = 'Child Topic';
      const content = 'Child Content';
      const parentId = 'parent-id';
      const parentTopic = new Topic('Parent Topic', 'Parent Content');
      const childTopic = new Topic(name, content, 1, parentId);
      
      mockTopicRepository.findById.mockResolvedValue(parentTopic);
      mockTopicRepository.createChildTopic.mockResolvedValue(childTopic);
      
      // Act
      const result = await topicService.createTopic(name, content, testUser, parentId);
      
      // Assert
      expect(mockTopicRepository.findById).toHaveBeenCalledWith(parentId);
      expect(mockTopicRepository.createChildTopic).toHaveBeenCalledWith(parentId, name, content);
      expect(result).toBe(childTopic);
    });
    
    it('should throw an error if parent topic not found', async () => {
      // Arrange
      const name = 'Child Topic';
      const content = 'Child Content';
      const parentId = 'non-existent-id';
      
      mockTopicRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(topicService.createTopic(name, content, testUser, parentId))
        .rejects.toThrow(`Parent topic with ID ${parentId} not found`);
    });
  });
  
  describe('getTopic', () => {
    it('should get a topic by ID', async () => {
      // Arrange
      const id = 'topic-id';
      const topic = new Topic('Test Topic', 'Test Content');
      
      mockTopicRepository.findById.mockResolvedValue(topic);
      
      // Act
      const result = await topicService.getTopic(id, testUser);
      
      // Assert
      expect(mockTopicRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(topic);
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      
      mockTopicRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await topicService.getTopic(id, testUser);
      
      // Assert
      expect(mockTopicRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });
  
  describe('updateTopic', () => {
    it('should update a topic', async () => {
      // Arrange
      const id = 'topic-id';
      const content = 'Updated Content';
      const updatedTopic = new Topic('Test Topic', content, 2);
      
      mockTopicRepository.createNewVersion.mockResolvedValue(updatedTopic);
      
      // Act
      const result = await topicService.updateTopic(id, content, testUser);
      
      // Assert
      expect(mockTopicRepository.createNewVersion).toHaveBeenCalledWith(id, content, undefined);
      expect(result).toBe(updatedTopic);
    });
    
    it('should update a topic with a new name', async () => {
      // Arrange
      const id = 'topic-id';
      const content = 'Updated Content';
      const name = 'New Name';
      const updatedTopic = new Topic(name, content, 2);
      
      mockTopicRepository.createNewVersion.mockResolvedValue(updatedTopic);
      
      // Act
      const result = await topicService.updateTopic(id, content, testUser, name);
      
      // Assert
      expect(mockTopicRepository.createNewVersion).toHaveBeenCalledWith(id, content, name);
      expect(result).toBe(updatedTopic);
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const content = 'Updated Content';
      
      mockTopicRepository.createNewVersion.mockResolvedValue(null);
      
      // Act
      const result = await topicService.updateTopic(id, content, testUser);
      
      // Assert
      expect(mockTopicRepository.createNewVersion).toHaveBeenCalledWith(id, content, undefined);
      expect(result).toBeNull();
    });
  });
  
  describe('deleteTopic', () => {
    it('should delete a topic with no children', async () => {
      // Arrange
      const id = 'topic-id';
      
      mockTopicRepository.findByParentId.mockResolvedValue([]);
      mockTopicRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await topicService.deleteTopic(id, testUser);
      
      // Assert
      expect(mockTopicRepository.findByParentId).toHaveBeenCalledWith(id);
      expect(mockTopicRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });
    
    it('should throw an error if topic has children', async () => {
      // Arrange
      const id = 'topic-id';
      const childTopic = new Topic('Child Topic', 'Child Content', 1, id);
      
      mockTopicRepository.findByParentId.mockResolvedValue([childTopic]);
      
      // Act & Assert
      await expect(topicService.deleteTopic(id, testUser))
        .rejects.toThrow('Cannot delete a topic with child topics');
    });
    
    it('should return false if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      
      mockTopicRepository.findByParentId.mockResolvedValue([]);
      mockTopicRepository.delete.mockResolvedValue(false);
      
      // Act
      const result = await topicService.deleteTopic(id, testUser);
      
      // Assert
      expect(mockTopicRepository.findByParentId).toHaveBeenCalledWith(id);
      expect(mockTopicRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(false);
    });
  });
  
  describe('getAllTopics', () => {
    it('should get all topics', async () => {
      // Arrange
      const topics = [
        new Topic('Topic 1', 'Content 1'),
        new Topic('Topic 2', 'Content 2')
      ];
      
      mockTopicRepository.findAll.mockResolvedValue(topics);
      
      // Act
      const result = await topicService.getAllTopics(testUser);
      
      // Assert
      expect(mockTopicRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(topics);
    });
  });
  
  describe('getRootTopics', () => {
    it('should get all root topics', async () => {
      // Arrange
      const topics = [
        new Topic('Root Topic 1', 'Content 1'),
        new Topic('Root Topic 2', 'Content 2')
      ];
      
      mockTopicRepository.findRootTopics.mockResolvedValue(topics);
      
      // Act
      const result = await topicService.getRootTopics(testUser);
      
      // Assert
      expect(mockTopicRepository.findRootTopics).toHaveBeenCalled();
      expect(result).toEqual(topics);
    });
  });
  
  describe('getChildTopics', () => {
    it('should get child topics of a parent', async () => {
      // Arrange
      const parentId = 'parent-id';
      const childTopics = [
        new Topic('Child Topic 1', 'Content 1', 1, parentId),
        new Topic('Child Topic 2', 'Content 2', 1, parentId)
      ];
      
      mockTopicRepository.findByParentId.mockResolvedValue(childTopics);
      
      // Act
      const result = await topicService.getChildTopics(parentId, testUser);
      
      // Assert
      expect(mockTopicRepository.findByParentId).toHaveBeenCalledWith(parentId);
      expect(result).toEqual(childTopics);
    });
  });
  
  describe('getTopicVersion', () => {
    it('should get a specific version of a topic', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 2;
      const topic = new Topic('Test Topic', 'Version 2 Content', version);
      
      mockTopicRepository.findVersion.mockResolvedValue(topic);
      
      // Act
      const result = await topicService.getTopicVersion(rootTopicId, version, testUser);
      
      // Assert
      expect(mockTopicRepository.findVersion).toHaveBeenCalledWith(rootTopicId, version);
      expect(result).toBe(topic);
    });
    
    it('should return null if version not found', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 999;
      
      mockTopicRepository.findVersion.mockResolvedValue(null);
      
      // Act
      const result = await topicService.getTopicVersion(rootTopicId, version, testUser);
      
      // Assert
      expect(mockTopicRepository.findVersion).toHaveBeenCalledWith(rootTopicId, version);
      expect(result).toBeNull();
    });
  });
  
  describe('getAllTopicVersions', () => {
    it('should get all versions of a topic', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const versions = [
        new Topic('Test Topic', 'Version 1 Content', 1),
        new Topic('Test Topic', 'Version 2 Content', 2)
      ];
      
      mockTopicRepository.findAllVersions.mockResolvedValue(versions);
      
      // Act
      const result = await topicService.getAllTopicVersions(rootTopicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findAllVersions).toHaveBeenCalledWith(rootTopicId);
      expect(result).toEqual(versions);
    });
  });
  
  describe('getLatestTopicVersion', () => {
    it('should get the latest version of a topic', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const latestVersion = new Topic('Test Topic', 'Latest Content', 3);
      
      mockTopicRepository.findLatestVersion.mockResolvedValue(latestVersion);
      
      // Act
      const result = await topicService.getLatestTopicVersion(rootTopicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findLatestVersion).toHaveBeenCalledWith(rootTopicId);
      expect(result).toBe(latestVersion);
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const rootTopicId = 'non-existent-id';
      
      mockTopicRepository.findLatestVersion.mockResolvedValue(null);
      
      // Act
      const result = await topicService.getLatestTopicVersion(rootTopicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findLatestVersion).toHaveBeenCalledWith(rootTopicId);
      expect(result).toBeNull();
    });
  });
  
  describe('getTopicTree', () => {
    it('should get a topic tree', async () => {
      // Arrange
      const topicId = 'topic-id';
      const topic = new Topic('Test Topic', 'Test Content');
      const childTopic1 = new Topic('Child Topic 1', 'Child Content 1');
      const childTopic2 = new Topic('Child Topic 2', 'Child Content 2');
      
      // Set IDs for the topics
      Object.defineProperty(topic, 'id', { value: topicId });
      Object.defineProperty(childTopic1, 'id', { value: 'child-1' });
      Object.defineProperty(childTopic2, 'id', { value: 'child-2' });
      
      // Set parent IDs for the child topics
      Object.defineProperty(childTopic1, 'parentTopicId', { value: topicId });
      Object.defineProperty(childTopic2, 'parentTopicId', { value: topicId });
      
      mockTopicRepository.findById.mockResolvedValue(topic);
      mockTopicRepository.findAllChildrenRecursive.mockResolvedValue([childTopic1, childTopic2]);
      
      // Act
      const result = await topicService.getTopicTree(topicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findById).toHaveBeenCalledWith(topicId);
      expect(mockTopicRepository.findAllChildrenRecursive).toHaveBeenCalledWith(topicId);
      expect(result).toEqual({
        topic,
        children: [
          { topic: childTopic1, children: [] },
          { topic: childTopic2, children: [] }
        ]
      });
    });
    
    it('should return null if topic is not found', async () => {
      // Arrange
      const topicId = 'non-existent-id';
      mockTopicRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await topicService.getTopicTree(topicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findById).toHaveBeenCalledWith(topicId);
      expect(result).toBeNull();
    });
  });
  
  describe('findPath', () => {
    it('should find a path between two topics', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'end-id';
      const path = [
        new Topic('Start Topic', 'Start Content'),
        new Topic('Middle Topic', 'Middle Content'),
        new Topic('End Topic', 'End Content')
      ];
      
      mockTopicRepository.findPath.mockResolvedValue(path);
      
      // Act
      const result = await topicService.findPath(startTopicId, endTopicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findPath).toHaveBeenCalledWith(startTopicId, endTopicId);
      expect(result).toEqual(path);
    });
    
    it('should return null if no path found', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'unreachable-id';
      
      mockTopicRepository.findPath.mockResolvedValue(null);
      
      // Act
      const result = await topicService.findPath(startTopicId, endTopicId, testUser);
      
      // Assert
      expect(mockTopicRepository.findPath).toHaveBeenCalledWith(startTopicId, endTopicId);
      expect(result).toBeNull();
    });
  });
}); 