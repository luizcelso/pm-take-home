import { TopicRepository } from '../TopicRepository';
import { Topic } from '../../models/Topic';
import { JsonDatabase } from '../../database/JsonDatabase';

// Mock the JsonDatabase
jest.mock('../../database/JsonDatabase');

describe('TopicRepository', () => {
  let topicRepository: TopicRepository;
  let mockDatabase: jest.Mocked<JsonDatabase<Topic>>;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new repository instance
    topicRepository = new TopicRepository();
    
    // Get the mocked database from the repository
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockDatabase = (topicRepository as any).database as jest.Mocked<JsonDatabase<Topic>>;
  });
  
  describe('findByParentId', () => {
    it('should find topics by parent ID', async () => {
      // Arrange
      const parentId = 'parent-id';
      const childTopics = [
        new Topic('Child Topic 1', 'Content 1', 1, parentId),
        new Topic('Child Topic 2', 'Content 2', 1, parentId)
      ];
      
      mockDatabase.query.mockResolvedValue(childTopics);
      
      // Act
      const result = await topicRepository.findByParentId(parentId);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toEqual(childTopics);
    });
  });
  
  describe('findRootTopics', () => {
    it('should find root topics', async () => {
      // Arrange
      const rootTopics = [
        new Topic('Root Topic 1', 'Content 1'),
        new Topic('Root Topic 2', 'Content 2')
      ];
      
      mockDatabase.query.mockResolvedValue(rootTopics);
      
      // Act
      const result = await topicRepository.findRootTopics();
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toEqual(rootTopics);
    });
  });
  
  describe('findByName', () => {
    it('should find topics by name (case-insensitive)', async () => {
      // Arrange
      const name = 'test';
      const matchingTopics = [
        new Topic('Test Topic', 'Content 1'),
        new Topic('Another Test', 'Content 2')
      ];
      
      mockDatabase.query.mockResolvedValue(matchingTopics);
      
      // Act
      const result = await topicRepository.findByName(name);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toEqual(matchingTopics);
    });
  });
  
  describe('createNewVersion', () => {
    it('should create a new version of a topic', async () => {
      // Arrange
      const id = 'test-id';
      const content = 'Updated content';
      const topic = new Topic('Test Topic', 'Original content');
      const newVersion = new Topic('Test Topic', content, 2, undefined, undefined, undefined, undefined, topic.id, topic.id);
      
      mockDatabase.findById.mockResolvedValue(topic);
      mockDatabase.create.mockResolvedValue(newVersion);
      
      // Act
      const result = await topicRepository.createNewVersion(id, content);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(id);
      expect(mockDatabase.create).toHaveBeenCalledWith(expect.any(Topic));
      expect(result).toEqual(expect.objectContaining({
        name: 'Test Topic',
        content: 'Updated content',
        version: 2
      }));
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const newContent = 'Updated content';
      
      mockDatabase.findById.mockResolvedValue(null);
      
      // Act
      const result = await topicRepository.createNewVersion(id, newContent);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(id);
      expect(mockDatabase.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('findAllVersions', () => {
    it('should find all versions of a topic', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const versions = [
        new Topic('Test Topic', 'Version 1 content', 1, undefined, undefined, undefined, undefined, undefined, rootTopicId),
        new Topic('Test Topic', 'Version 2 content', 2, undefined, undefined, undefined, undefined, undefined, rootTopicId)
      ];
      
      mockDatabase.query.mockResolvedValue(versions);
      
      // Act
      const result = await topicRepository.findAllVersions(rootTopicId);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toEqual(versions);
    });
  });
  
  describe('findVersion', () => {
    it('should find a specific version of a topic', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 2;
      const versions = [
        new Topic('Test Topic', 'Version 1 content', 1, undefined, undefined, undefined, undefined, undefined, rootTopicId),
        new Topic('Test Topic', 'Version 2 content', 2, undefined, undefined, undefined, undefined, undefined, rootTopicId)
      ];
      
      mockDatabase.query.mockResolvedValue(versions);
      
      // Act
      const result = await topicRepository.findVersion(rootTopicId, version);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toBe(versions[1]);
    });
    
    it('should return null if version not found', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 3;
      const versions = [
        new Topic('Test Topic', 'Version 1 content', 1, undefined, undefined, undefined, undefined, undefined, rootTopicId),
        new Topic('Test Topic', 'Version 2 content', 2, undefined, undefined, undefined, undefined, undefined, rootTopicId)
      ];
      
      mockDatabase.query.mockResolvedValue(versions);
      
      // Act
      const result = await topicRepository.findVersion(rootTopicId, version);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('findLatestVersion', () => {
    it('should find the latest version of a topic', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const versions = [
        new Topic('Test Topic', 'Version 1 content', 1, undefined, undefined, undefined, undefined, undefined, rootTopicId),
        new Topic('Test Topic', 'Version 2 content', 2, undefined, undefined, undefined, undefined, undefined, rootTopicId),
        new Topic('Test Topic', 'Version 3 content', 3, undefined, undefined, undefined, undefined, undefined, rootTopicId)
      ];
      
      mockDatabase.query.mockResolvedValue(versions);
      
      // Act
      const result = await topicRepository.findLatestVersion(rootTopicId);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        name: 'Test Topic',
        content: 'Version 3 content',
        version: 3,
        rootTopicId: rootTopicId
      }));
    });
    
    it('should return null if no versions found', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      
      mockDatabase.query.mockResolvedValue([]);
      
      // Act
      const result = await topicRepository.findLatestVersion(rootTopicId);
      
      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('createChildTopic', () => {
    it('should create a child topic', async () => {
      // Arrange
      const parentId = 'parent-id';
      const name = 'Child Topic';
      const content = 'Child Content';
      const parentTopic = new Topic('Parent Topic', 'Parent Content');
      const childTopic = new Topic(name, content, 1, parentId);
      
      mockDatabase.findById.mockResolvedValue(parentTopic);
      mockDatabase.create.mockResolvedValue(childTopic);
      
      // Act
      const result = await topicRepository.createChildTopic(parentId, name, content);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(parentId);
      expect(mockDatabase.create).toHaveBeenCalledWith(expect.any(Topic));
      expect(result).toBe(childTopic);
    });
    
    it('should return null if parent topic not found', async () => {
      // Arrange
      const parentId = 'non-existent-id';
      const name = 'Child Topic';
      const content = 'Child Content';
      
      mockDatabase.findById.mockResolvedValue(null);
      
      // Act
      const result = await topicRepository.createChildTopic(parentId, name, content);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(parentId);
      expect(mockDatabase.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('findAllChildrenRecursive', () => {
    it('should find all children recursively', async () => {
      // Arrange
      const topicId = 'topic-id';
      const childTopic1 = new Topic('Child Topic 1', 'Content 1', 1, topicId);
      const childTopic2 = new Topic('Child Topic 2', 'Content 2', 1, topicId);
      const grandchildTopic = new Topic('Grandchild Topic', 'Content 3', 1, childTopic1.id);
      
      // Mock the findByParentId method to return different results for different calls
      jest.spyOn(topicRepository, 'findByParentId')
        .mockResolvedValueOnce([childTopic1, childTopic2])  // First call for topicId
        .mockResolvedValueOnce([grandchildTopic])           // Second call for childTopic1.id
        .mockResolvedValueOnce([]);                         // Third call for childTopic2.id
      
      // Act
      const result = await topicRepository.findAllChildrenRecursive(topicId);
      
      // Assert
      expect(topicRepository.findByParentId).toHaveBeenCalledWith(topicId);
      expect(topicRepository.findByParentId).toHaveBeenCalledWith(childTopic1.id);
      expect(topicRepository.findByParentId).toHaveBeenCalledWith(childTopic2.id);
      expect(result).toHaveLength(3);
      expect(result).toContain(childTopic1);
      expect(result).toContain(childTopic2);
      expect(result).toContain(grandchildTopic);
    });
  });
  
  describe('findPath', () => {
    it('should find the shortest path between two topics', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const middleTopicId = 'middle-id';
      const endTopicId = 'end-id';
      
      // Create topics with explicit IDs via constructor
      const startTopic = new Topic('Start Topic', 'Start Content', 1, undefined, startTopicId);
      const middleTopic = new Topic('Middle Topic', 'Middle Content', 1, startTopicId, middleTopicId);
      const endTopic = new Topic('End Topic', 'End Content', 1, middleTopicId, endTopicId);
      
      const allTopics = [startTopic, middleTopic, endTopic];
      
      mockDatabase.findById
        .mockResolvedValueOnce(startTopic)  // First call for startTopic
        .mockResolvedValueOnce(endTopic);   // Second call for endTopic
      
      mockDatabase.findAll.mockResolvedValue(allTopics);
      
      // Act
      const result = await topicRepository.findPath(startTopicId, endTopicId);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(startTopicId);
      expect(mockDatabase.findById).toHaveBeenCalledWith(endTopicId);
      expect(mockDatabase.findAll).toHaveBeenCalled();
      
      // Check that the path is correct
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(expect.objectContaining({
          id: startTopicId,
          name: 'Start Topic'
        }));
        expect(result[1]).toEqual(expect.objectContaining({
          id: middleTopicId,
          name: 'Middle Topic',
          parentTopicId: startTopicId
        }));
        expect(result[2]).toEqual(expect.objectContaining({
          id: endTopicId,
          name: 'End Topic',
          parentTopicId: middleTopicId
        }));
      }
    });
    
    it('should return null if start topic not found', async () => {
      // Arrange
      const startTopicId = 'non-existent-id';
      const endTopicId = 'end-id';
      
      mockDatabase.findById.mockResolvedValue(null);
      
      // Act
      const result = await topicRepository.findPath(startTopicId, endTopicId);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(startTopicId);
      expect(result).toBeNull();
    });
    
    it('should return null if end topic not found', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'non-existent-id';
      const startTopic = new Topic('Start Topic', 'Start Content');
      
      mockDatabase.findById
        .mockResolvedValueOnce(startTopic)  // First call for startTopic
        .mockResolvedValueOnce(null);       // Second call for endTopic
      
      // Act
      const result = await topicRepository.findPath(startTopicId, endTopicId);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(startTopicId);
      expect(mockDatabase.findById).toHaveBeenCalledWith(endTopicId);
      expect(result).toBeNull();
    });
    
    it('should return null if no path exists', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'end-id';
      const startTopic = new Topic('Start Topic', 'Start Content');
      const endTopic = new Topic('End Topic', 'End Content');
      
      // No parent-child relationships, so no path exists
      
      const allTopics = [startTopic, endTopic];
      
      mockDatabase.findById
        .mockResolvedValueOnce(startTopic)  // First call for startTopic
        .mockResolvedValueOnce(endTopic);   // Second call for endTopic
      
      mockDatabase.findAll.mockResolvedValue(allTopics);
      
      // Act
      const result = await topicRepository.findPath(startTopicId, endTopicId);
      
      // Assert
      expect(mockDatabase.findById).toHaveBeenCalledWith(startTopicId);
      expect(mockDatabase.findById).toHaveBeenCalledWith(endTopicId);
      expect(mockDatabase.findAll).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
}); 