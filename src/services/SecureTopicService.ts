import { ITopicService, TopicTree } from './ITopicService';
import { Topic } from '../models/Topic';
import { User } from '../models/User';
import { TopicService } from './TopicService';
import { TopicAccessStrategyFactory } from './strategies/TopicAccessStrategyFactory';

/**
 * Secure topic service that enforces access control
 */
export class SecureTopicService implements ITopicService {
  private readonly topicService: TopicService;

  /**
   * Creates a new SecureTopicService instance
   * @param topicService The topic service to delegate to
   */
  constructor(topicService?: TopicService) {
    this.topicService = topicService || new TopicService();
  }

  /**
   * Creates a new topic if the user has permission
   * @param name The name of the topic
   * @param content The content of the topic
   * @param user The user creating the topic
   * @param parentTopicId Optional ID of the parent topic
   * @returns Promise resolving to the created topic
   * @throws Error if the user doesn't have permission
   */
  public async createTopic(
    name: string,
    content: string,
    user: User,
    parentTopicId?: string
  ): Promise<Topic> {
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canCreateTopic(user, parentTopicId)) {
      throw new Error('User does not have permission to create topics');
    }
    
    return this.topicService.createTopic(name, content, parentTopicId);
  }

  /**
   * Gets a topic by ID if the user has permission
   * @param id The ID of the topic
   * @param user The user requesting the topic
   * @returns Promise resolving to the topic or null if not found
   * @throws Error if the user doesn't have permission
   */
  public async getTopic(id: string, user: User): Promise<Topic | null> {
    const topic = await this.topicService.getTopic(id);
    
    if (!topic) {
      return null;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canReadTopic(user, topic)) {
      throw new Error('User does not have permission to read this topic');
    }
    
    return topic;
  }

  /**
   * Updates a topic if the user has permission
   * @param id The ID of the topic to update
   * @param content The new content for the topic
   * @param user The user updating the topic
   * @param name Optional new name for the topic
   * @returns Promise resolving to the updated topic
   * @throws Error if the user doesn't have permission
   */
  public async updateTopic(
    id: string,
    content: string,
    user: User,
    name?: string
  ): Promise<Topic | null> {
    const topic = await this.topicService.getTopic(id);
    
    if (!topic) {
      return null;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canUpdateTopic(user, topic)) {
      throw new Error('User does not have permission to update this topic');
    }
    
    return this.topicService.updateTopic(id, content, name);
  }

  /**
   * Deletes a topic if the user has permission
   * @param id The ID of the topic to delete
   * @param user The user deleting the topic
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if the user doesn't have permission
   */
  public async deleteTopic(id: string, user: User): Promise<boolean> {
    const topic = await this.topicService.getTopic(id);
    
    if (!topic) {
      return false;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canDeleteTopic(user, topic)) {
      throw new Error('User does not have permission to delete this topic');
    }
    
    return this.topicService.deleteTopic(id);
  }

  /**
   * Gets all topics if the user has permission
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of topics
   */
  public async getAllTopics(user: User): Promise<Topic[]> {
    const topics = await this.topicService.getAllTopics();
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    // Filter out topics the user doesn't have permission to read
    return topics.filter(topic => strategy.canReadTopic(user, topic));
  }

  /**
   * Gets all root topics if the user has permission
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of root topics
   */
  public async getRootTopics(user: User): Promise<Topic[]> {
    const topics = await this.topicService.getRootTopics();
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    // Filter out topics the user doesn't have permission to read
    return topics.filter(topic => strategy.canReadTopic(user, topic));
  }

  /**
   * Gets all child topics of a parent topic if the user has permission
   * @param parentId The ID of the parent topic
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of child topics
   */
  public async getChildTopics(parentId: string, user: User): Promise<Topic[]> {
    const topics = await this.topicService.getChildTopics(parentId);
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    // Filter out topics the user doesn't have permission to read
    return topics.filter(topic => strategy.canReadTopic(user, topic));
  }

  /**
   * Gets a specific version of a topic if the user has permission
   * @param rootTopicId The ID of the root topic
   * @param version The version number
   * @param user The user requesting the topic
   * @returns Promise resolving to the topic version or null if not found
   * @throws Error if the user doesn't have permission
   */
  public async getTopicVersion(
    rootTopicId: string,
    version: number,
    user: User
  ): Promise<Topic | null> {
    const topic = await this.topicService.getTopicVersion(rootTopicId, version);
    
    if (!topic) {
      return null;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canReadTopic(user, topic)) {
      throw new Error('User does not have permission to read this topic version');
    }
    
    return topic;
  }

  /**
   * Gets all versions of a topic if the user has permission
   * @param rootTopicId The ID of the root topic
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of topic versions
   */
  public async getAllTopicVersions(rootTopicId: string, user: User): Promise<Topic[]> {
    const topics = await this.topicService.getAllTopicVersions(rootTopicId);
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    // Filter out topics the user doesn't have permission to read
    return topics.filter(topic => strategy.canReadTopic(user, topic));
  }

  /**
   * Gets the latest version of a topic if the user has permission
   * @param rootTopicId The ID of the root topic
   * @param user The user requesting the topic
   * @returns Promise resolving to the latest topic version or null if not found
   * @throws Error if the user doesn't have permission
   */
  public async getLatestTopicVersion(
    rootTopicId: string,
    user: User
  ): Promise<Topic | null> {
    const topic = await this.topicService.getLatestTopicVersion(rootTopicId);
    
    if (!topic) {
      return null;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canReadTopic(user, topic)) {
      throw new Error('User does not have permission to read this topic version');
    }
    
    return topic;
  }

  /**
   * Gets a topic tree if the user has permission
   * @param topicId The ID of the topic
   * @param user The user requesting the topic tree
   * @returns Promise resolving to the topic tree
   */
  public async getTopicTree(topicId: string, user: User): Promise<TopicTree | null> {
    const topic = await this.topicService.getTopic(topicId);
    
    if (!topic) {
      return null;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canReadTopic(user, topic)) {
      throw new Error('User does not have permission to read this topic');
    }
    
    const tree = await this.topicService.getTopicTree(topicId);
    
    if (!tree) {
      return null;
    }
    
    // Filter the tree recursively to remove topics the user doesn't have permission to read
    return this.filterTopicTree(tree, user);
  }

  /**
   * Filters a topic tree to remove topics the user doesn't have permission to read
   * @param tree The topic tree to filter
   * @param user The user
   * @returns The filtered topic tree
   */
  private filterTopicTree(tree: TopicTree, user: User): TopicTree {
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    // Filter children recursively
    const filteredChildren = tree.children
      .filter(child => strategy.canReadTopic(user, child.topic))
      .map(child => this.filterTopicTree(child, user));
    
    return {
      topic: tree.topic,
      children: filteredChildren
    };
  }

  /**
   * Finds the shortest path between two topics if the user has permission
   * @param startTopicId The ID of the start topic
   * @param endTopicId The ID of the end topic
   * @param user The user requesting the path
   * @returns Promise resolving to an array of topics representing the path
   * @throws Error if the user doesn't have permission
   */
  public async findPath(
    startTopicId: string,
    endTopicId: string,
    user: User
  ): Promise<Topic[] | null> {
    const startTopic = await this.topicService.getTopic(startTopicId);
    const endTopic = await this.topicService.getTopic(endTopicId);
    
    if (!startTopic || !endTopic) {
      return null;
    }
    
    const strategy = TopicAccessStrategyFactory.getStrategy(user);
    
    if (!strategy.canReadTopic(user, startTopic) || !strategy.canReadTopic(user, endTopic)) {
      throw new Error('User does not have permission to read one of the topics');
    }
    
    const path = await this.topicService.findPath(startTopicId, endTopicId);
    
    if (!path) {
      return null;
    }
    
    // Filter out topics the user doesn't have permission to read
    return path.filter(topic => strategy.canReadTopic(user, topic));
  }
} 