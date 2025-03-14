import { SecureTopicService } from '../SecureTopicService';
import { TopicService } from '../TopicService';
import { Topic } from '../../models/Topic';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';
import { TopicAccessStrategyFactory } from '../strategies/TopicAccessStrategyFactory';
import { ITopicAccessStrategy } from '../strategies/ITopicAccessStrategy';

// Mock dependencies
jest.mock('../TopicService');
jest.mock('../strategies/TopicAccessStrategyFactory');

describe('SecureTopicService', () => {
  let secureTopicService: SecureTopicService;
  let mockTopicService: jest.Mocked<TopicService>;
  let mockStrategy: jest.Mocked<ITopicAccessStrategy>;
  let adminUser: User;
  let editorUser: User;
  let viewerUser: User;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock TopicService
    mockTopicService = new TopicService() as jest.Mocked<TopicService>;
    
    // Create mock strategy
    mockStrategy = {
      canCreateTopic: jest.fn(),
      canReadTopic: jest.fn(),
      canUpdateTopic: jest.fn(),
      canDeleteTopic: jest.fn()
    } as unknown as jest.Mocked<ITopicAccessStrategy>;
    
    // Mock the TopicAccessStrategyFactory.getStrategy method
    (TopicAccessStrategyFactory.getStrategy as jest.Mock).mockReturnValue(mockStrategy);
    
    // Create SecureTopicService with mock TopicService
    secureTopicService = new SecureTopicService(mockTopicService);
    
    // Create test users
    adminUser = new User('Admin User', 'admin@example.com', UserRole.ADMIN);
    editorUser = new User('Editor User', 'editor@example.com', UserRole.EDITOR);
    viewerUser = new User('Viewer User', 'viewer@example.com', UserRole.VIEWER);
  });
  
  describe('createTopic', () => {
    it('should create a topic if user has permission', async () => {
      // Arrange
      const name = 'Test Topic';
      const content = 'Test Content';
      const topic = new Topic(name, content);
      
      mockStrategy.canCreateTopic.mockReturnValue(true);
      mockTopicService.createTopic.mockResolvedValue(topic);
      
      // Act
      const result = await secureTopicService.createTopic(name, content, adminUser);
      
      // Assert
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(adminUser);
      expect(mockStrategy.canCreateTopic).toHaveBeenCalledWith(adminUser);
      expect(mockTopicService.createTopic).toHaveBeenCalledWith(name, content, adminUser, undefined);
      expect(result).toBe(topic);
    });
    
    it('should throw an error if user does not have permission', async () => {
      // Arrange
      const name = 'Test Topic';
      const content = 'Test Content';
      
      mockStrategy.canCreateTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.createTopic(name, content, viewerUser))
        .rejects.toThrow('User does not have permission to create topics');
      
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canCreateTopic).toHaveBeenCalledWith(viewerUser);
      expect(mockTopicService.createTopic).not.toHaveBeenCalled();
    });
  });
  
  describe('getTopic', () => {
    it('should get a topic if user has permission', async () => {
      // Arrange
      const id = 'topic-id';
      const topic = new Topic('Test Topic', 'Test Content');
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockStrategy.canReadTopic.mockReturnValue(true);
      
      // Act
      const result = await secureTopicService.getTopic(id, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, adminUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(adminUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(adminUser);
      expect(result).toBe(topic);
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      
      mockTopicService.getTopic.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.getTopic(id, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, adminUser);
      expect(result).toBeNull();
    });
    
    it('should throw an error if user does not have permission', async () => {
      // Arrange
      const id = 'topic-id';
      const topic = new Topic('Test Topic', 'Test Content');
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockStrategy.canReadTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.getTopic(id, viewerUser))
        .rejects.toThrow('User does not have permission to read this topic');
      
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(viewerUser);
    });
  });
  
  describe('updateTopic', () => {
    it('should update a topic if user has permission', async () => {
      // Arrange
      const id = 'topic-id';
      const content = 'Updated Content';
      const topic = new Topic('Test Topic', 'Test Content');
      const updatedTopic = new Topic('Test Topic', content, 2);
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockTopicService.updateTopic.mockResolvedValue(updatedTopic);
      mockStrategy.canUpdateTopic.mockReturnValue(true);
      
      // Act
      const result = await secureTopicService.updateTopic(id, content, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, adminUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(adminUser);
      expect(mockStrategy.canUpdateTopic).toHaveBeenCalledWith(adminUser);
      expect(mockTopicService.updateTopic).toHaveBeenCalledWith(id, content, adminUser, undefined);
      expect(result).toBe(updatedTopic);
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const content = 'Updated Content';
      
      mockTopicService.getTopic.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.updateTopic(id, content, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, adminUser);
      expect(result).toBeNull();
    });
    
    it('should throw an error if user does not have permission', async () => {
      // Arrange
      const id = 'topic-id';
      const content = 'Updated Content';
      const topic = new Topic('Test Topic', 'Test Content');
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockStrategy.canUpdateTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.updateTopic(id, content, viewerUser))
        .rejects.toThrow('User does not have permission to update this topic');
      
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canUpdateTopic).toHaveBeenCalledWith(viewerUser);
      expect(mockTopicService.updateTopic).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteTopic', () => {
    it('should delete a topic if user has permission', async () => {
      // Arrange
      const id = 'topic-id';
      const topic = new Topic('Test Topic', 'Test Content');
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockTopicService.deleteTopic.mockResolvedValue(true);
      mockStrategy.canDeleteTopic.mockReturnValue(true);
      
      // Act
      const result = await secureTopicService.deleteTopic(id, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, adminUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(adminUser);
      expect(mockStrategy.canDeleteTopic).toHaveBeenCalledWith(adminUser);
      expect(mockTopicService.deleteTopic).toHaveBeenCalledWith(id, adminUser);
      expect(result).toBe(true);
    });
    
    it('should return false if topic not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      
      mockTopicService.getTopic.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.deleteTopic(id, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, adminUser);
      expect(result).toBe(false);
    });
    
    it('should throw an error if user does not have permission', async () => {
      // Arrange
      const id = 'topic-id';
      const topic = new Topic('Test Topic', 'Test Content');
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockStrategy.canDeleteTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.deleteTopic(id, editorUser))
        .rejects.toThrow('User does not have permission to delete this topic');
      
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(id, editorUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(editorUser);
      expect(mockStrategy.canDeleteTopic).toHaveBeenCalledWith(editorUser);
      expect(mockTopicService.deleteTopic).not.toHaveBeenCalled();
    });
  });
  
  describe('getAllTopics', () => {
    it('should filter topics based on user permissions', async () => {
      // Arrange
      const topics = [
        new Topic('Topic 1', 'Content 1'),
        new Topic('Topic 2', 'Content 2'),
        new Topic('Topic 3', 'Content 3')
      ];
      
      mockTopicService.getAllTopics.mockResolvedValue(topics);
      
      // User can read Topic 1 and Topic 3, but not Topic 2
      mockStrategy.canReadTopic
        .mockReturnValueOnce(true)   // Topic 1
        .mockReturnValueOnce(false)  // Topic 2
        .mockReturnValueOnce(true);  // Topic 3
      
      // Act
      const result = await secureTopicService.getAllTopics(viewerUser);
      
      // Assert
      expect(mockTopicService.getAllTopics).toHaveBeenCalledWith(viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(topics[0]);
      expect(result[1]).toBe(topics[2]);
    });
  });
  
  describe('getRootTopics', () => {
    it('should filter root topics based on user permissions', async () => {
      // Arrange
      const topics = [
        new Topic('Root Topic 1', 'Content 1'),
        new Topic('Root Topic 2', 'Content 2')
      ];
      
      mockTopicService.getRootTopics.mockResolvedValue(topics);
      
      // User can read Root Topic 1, but not Root Topic 2
      mockStrategy.canReadTopic
        .mockReturnValueOnce(true)   // Root Topic 1
        .mockReturnValueOnce(false); // Root Topic 2
      
      // Act
      const result = await secureTopicService.getRootTopics(viewerUser);
      
      // Assert
      expect(mockTopicService.getRootTopics).toHaveBeenCalledWith(viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(topics[0]);
    });
  });
  
  describe('getChildTopics', () => {
    it('should filter child topics based on user permissions', async () => {
      // Arrange
      const parentId = 'parent-id';
      const childTopics = [
        new Topic('Child Topic 1', 'Content 1', 1, parentId),
        new Topic('Child Topic 2', 'Content 2', 1, parentId)
      ];
      
      mockTopicService.getChildTopics.mockResolvedValue(childTopics);
      
      // User can read Child Topic 1, but not Child Topic 2
      mockStrategy.canReadTopic
        .mockReturnValueOnce(true)   // Child Topic 1
        .mockReturnValueOnce(false); // Child Topic 2
      
      // Act
      const result = await secureTopicService.getChildTopics(parentId, viewerUser);
      
      // Assert
      expect(mockTopicService.getChildTopics).toHaveBeenCalledWith(parentId, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(childTopics[0]);
    });
  });
  
  describe('getTopicVersion', () => {
    it('should get a topic version if user has permission', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 2;
      const topic = new Topic('Test Topic', 'Version 2 Content', version);
      
      mockTopicService.getTopicVersion.mockResolvedValue(topic);
      mockStrategy.canReadTopic.mockReturnValue(true);
      
      // Act
      const result = await secureTopicService.getTopicVersion(rootTopicId, version, adminUser);
      
      // Assert
      expect(mockTopicService.getTopicVersion).toHaveBeenCalledWith(rootTopicId, version, adminUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(adminUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(adminUser, topic);
      expect(result).toBe(topic);
    });
    
    it('should return null if topic version not found', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 999;
      
      mockTopicService.getTopicVersion.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.getTopicVersion(rootTopicId, version, adminUser);
      
      // Assert
      expect(mockTopicService.getTopicVersion).toHaveBeenCalledWith(rootTopicId, version, adminUser);
      expect(result).toBeNull();
    });
    
    it('should throw an error if user does not have permission', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const version = 2;
      const topic = new Topic('Test Topic', 'Version 2 Content', version);
      
      mockTopicService.getTopicVersion.mockResolvedValue(topic);
      mockStrategy.canReadTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.getTopicVersion(rootTopicId, version, viewerUser))
        .rejects.toThrow('User does not have permission to read this topic version');
      
      expect(mockTopicService.getTopicVersion).toHaveBeenCalledWith(rootTopicId, version, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(viewerUser, topic);
    });
  });
  
  describe('getAllTopicVersions', () => {
    it('should filter topic versions based on user permissions', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const versions = [
        new Topic('Test Topic', 'Version 1 Content', 1),
        new Topic('Test Topic', 'Version 2 Content', 2),
        new Topic('Test Topic', 'Version 3 Content', 3)
      ];
      
      mockTopicService.getAllTopicVersions.mockResolvedValue(versions);
      
      // User can read Version 1 and Version 3, but not Version 2
      mockStrategy.canReadTopic
        .mockReturnValueOnce(true)   // Version 1
        .mockReturnValueOnce(false)  // Version 2
        .mockReturnValueOnce(true);  // Version 3
      
      // Act
      const result = await secureTopicService.getAllTopicVersions(rootTopicId, viewerUser);
      
      // Assert
      expect(mockTopicService.getAllTopicVersions).toHaveBeenCalledWith(rootTopicId, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(versions[0]);
      expect(result[1]).toBe(versions[2]);
    });
  });
  
  describe('getLatestTopicVersion', () => {
    it('should get the latest topic version if user has permission', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const latestVersion = new Topic('Test Topic', 'Latest Content', 3);
      
      mockTopicService.getLatestTopicVersion.mockResolvedValue(latestVersion);
      mockStrategy.canReadTopic.mockReturnValue(true);
      
      // Act
      const result = await secureTopicService.getLatestTopicVersion(rootTopicId, adminUser);
      
      // Assert
      expect(mockTopicService.getLatestTopicVersion).toHaveBeenCalledWith(rootTopicId, adminUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(adminUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(adminUser, latestVersion);
      expect(result).toBe(latestVersion);
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const rootTopicId = 'non-existent-id';
      
      mockTopicService.getLatestTopicVersion.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.getLatestTopicVersion(rootTopicId, adminUser);
      
      // Assert
      expect(mockTopicService.getLatestTopicVersion).toHaveBeenCalledWith(rootTopicId, adminUser);
      expect(result).toBeNull();
    });
    
    it('should throw an error if user does not have permission', async () => {
      // Arrange
      const rootTopicId = 'root-topic-id';
      const latestVersion = new Topic('Test Topic', 'Latest Content', 3);
      
      mockTopicService.getLatestTopicVersion.mockResolvedValue(latestVersion);
      mockStrategy.canReadTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.getLatestTopicVersion(rootTopicId, viewerUser))
        .rejects.toThrow('User does not have permission to read this topic version');
      
      expect(mockTopicService.getLatestTopicVersion).toHaveBeenCalledWith(rootTopicId, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(viewerUser, latestVersion);
    });
  });
  
  describe('getTopicTree', () => {
    it('should filter topic tree based on user permissions', async () => {
      // Arrange
      const topicId = 'topic-id';
      const topic = new Topic('Root Topic', 'Root Content');
      const childTopic1 = new Topic('Child Topic 1', 'Child Content 1', 1, topicId);
      const childTopic2 = new Topic('Child Topic 2', 'Child Content 2', 1, topicId);
      
      const topicTree = {
        topic,
        children: [
          { topic: childTopic1, children: [] },
          { topic: childTopic2, children: [] }
        ]
      };
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockTopicService.getTopicTree.mockResolvedValue(topicTree);
      
      // User can read the root topic and Child Topic 1, but not Child Topic 2
      mockStrategy.canReadTopic
        .mockReturnValueOnce(true)   // Root Topic (for initial permission check)
        .mockReturnValueOnce(true)   // Child Topic 1
        .mockReturnValueOnce(false); // Child Topic 2
      
      // Act
      const result = await secureTopicService.getTopicTree(topicId, editorUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(topicId, editorUser);
      expect(mockTopicService.getTopicTree).toHaveBeenCalledWith(topicId, editorUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(editorUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledTimes(3);
      
      // Check that the tree is filtered correctly
      expect(result).toEqual({
        topic,
        children: [
          { topic: childTopic1, children: [] }
          // Child Topic 2 should be filtered out
        ]
      });
    });
    
    it('should return null if topic not found', async () => {
      // Arrange
      const topicId = 'non-existent-id';
      
      mockTopicService.getTopic.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.getTopicTree(topicId, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(topicId, adminUser);
      expect(result).toBeNull();
    });
    
    it('should throw an error if user does not have permission to read the root topic', async () => {
      // Arrange
      const topicId = 'topic-id';
      const topic = new Topic('Root Topic', 'Root Content');
      
      mockTopicService.getTopic.mockResolvedValue(topic);
      mockStrategy.canReadTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.getTopicTree(topicId, viewerUser))
        .rejects.toThrow('User does not have permission to read this topic');
      
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(topicId, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(viewerUser, topic);
      expect(mockTopicService.getTopicTree).not.toHaveBeenCalled();
    });
  });
  
  describe('findPath', () => {
    it('should filter path based on user permissions', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'end-id';
      const startTopic = new Topic('Start Topic', 'Start Content');
      const middleTopic = new Topic('Middle Topic', 'Middle Content');
      const endTopic = new Topic('End Topic', 'End Content');
      const path = [startTopic, middleTopic, endTopic];
      
      mockTopicService.getTopic
        .mockResolvedValueOnce(startTopic)  // First call for startTopic
        .mockResolvedValueOnce(endTopic);   // Second call for endTopic
      
      mockTopicService.findPath.mockResolvedValue(path);
      
      // User can read start and end topics, but not middle topic
      mockStrategy.canReadTopic
        .mockReturnValueOnce(true)   // Start Topic (initial check)
        .mockReturnValueOnce(true)   // End Topic (initial check)
        .mockReturnValueOnce(true)   // Start Topic (in path)
        .mockReturnValueOnce(false)  // Middle Topic (in path)
        .mockReturnValueOnce(true);  // End Topic (in path)
      
      // Act
      const result = await secureTopicService.findPath(startTopicId, endTopicId, editorUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(startTopicId, editorUser);
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(endTopicId, editorUser);
      expect(mockTopicService.findPath).toHaveBeenCalledWith(startTopicId, endTopicId, editorUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(editorUser);
      
      // Check that the path is filtered correctly
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(startTopic);
        expect(result[1]).toBe(endTopic);
      }
    });
    
    it('should return null if start or end topic not found', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'end-id';
      
      mockTopicService.getTopic.mockResolvedValue(null);
      
      // Act
      const result = await secureTopicService.findPath(startTopicId, endTopicId, adminUser);
      
      // Assert
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(startTopicId, adminUser);
      expect(result).toBeNull();
    });
    
    it('should throw an error if user does not have permission to read start topic', async () => {
      // Arrange
      const startTopicId = 'start-id';
      const endTopicId = 'end-id';
      const startTopic = new Topic('Start Topic', 'Start Content');
      
      mockTopicService.getTopic.mockResolvedValue(startTopic);
      mockStrategy.canReadTopic.mockReturnValue(false);
      
      // Act & Assert
      await expect(secureTopicService.findPath(startTopicId, endTopicId, viewerUser))
        .rejects.toThrow('User does not have permission to read one of the topics');
      
      expect(mockTopicService.getTopic).toHaveBeenCalledWith(startTopicId, viewerUser);
      expect(TopicAccessStrategyFactory.getStrategy).toHaveBeenCalledWith(viewerUser);
      expect(mockStrategy.canReadTopic).toHaveBeenCalledWith(viewerUser, startTopic);
      expect(mockTopicService.findPath).not.toHaveBeenCalled();
    });
  });
}); 