import { ITopicService, TopicTree } from './ITopicService';
import { Topic } from '../models/Topic';
import { User } from '../models/User';
import { TopicRepository } from '../repositories/TopicRepository';

/**
 * Service for topic operations
 */
export class TopicService implements ITopicService {
  private readonly topicRepository: TopicRepository;

  /**
   * Creates a new TopicService instance
   * @param topicRepository The topic repository to use
   */
  constructor(topicRepository?: TopicRepository) {
    this.topicRepository = topicRepository || new TopicRepository();
  }

  /**
   * Creates a new topic
   * @param name The name of the topic
   * @param content The content of the topic
   * @param user The user creating the topic (not used in this implementation)
   * @param parentTopicId Optional ID of the parent topic
   * @returns Promise resolving to the created topic
   */
  public async createTopic(
    name: string,
    content: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User,
    parentTopicId?: string
  ): Promise<Topic> {
    if (parentTopicId) {
      const parentTopic = await this.topicRepository.findById(parentTopicId);
      
      if (!parentTopic) {
        throw new Error(`Parent topic with ID ${parentTopicId} not found`);
      }
      
      return this.topicRepository.createChildTopic(parentTopicId, name, content) as Promise<Topic>;
    }
    
    const topic = new Topic(name, content);
    return this.topicRepository.create(topic);
  }

  /**
   * Gets a topic by ID
   * @param id The ID of the topic
   * @param user The user requesting the topic (not used in this implementation)
   * @returns Promise resolving to the topic or null if not found
   */
  public async getTopic(
    id: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic | null> {
    return this.topicRepository.findById(id);
  }

  /**
   * Updates a topic, creating a new version
   * @param id The ID of the topic to update
   * @param content The new content for the topic
   * @param user The user updating the topic (not used in this implementation)
   * @param name Optional new name for the topic
   * @returns Promise resolving to the updated topic
   */
  public async updateTopic(
    id: string,
    content: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User,
    name?: string
  ): Promise<Topic | null> {
    return this.topicRepository.createNewVersion(id, content, name);
  }

  /**
   * Deletes a topic
   * @param id The ID of the topic to delete
   * @param user The user deleting the topic (not used in this implementation)
   * @returns Promise resolving to true if deleted, false if not found
   */
  public async deleteTopic(
    id: string, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<boolean> {
    // First, check if the topic has child topics
    const childTopics = await this.topicRepository.findByParentId(id);
    
    if (childTopics.length > 0) {
      throw new Error('Cannot delete a topic with child topics');
    }
    
    return this.topicRepository.delete(id);
  }

  /**
   * Gets all topics
   * @param user The user requesting the topics (not used in this implementation)
   * @returns Promise resolving to an array of all topics
   */
  public async getAllTopics(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic[]> {
    return this.topicRepository.findAll();
  }

  /**
   * Gets all root topics (topics without a parent)
   * @param user The user requesting the topics (not used in this implementation)
   * @returns Promise resolving to an array of root topics
   */
  public async getRootTopics(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic[]> {
    return this.topicRepository.findRootTopics();
  }

  /**
   * Gets all child topics for a parent topic
   * @param parentId The ID of the parent topic
   * @param user The user requesting the topics (not used in this implementation)
   * @returns Promise resolving to an array of child topics
   */
  public async getChildTopics(
    parentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic[]> {
    return this.topicRepository.findByParentId(parentId);
  }

  /**
   * Gets a specific version of a topic
   * @param rootTopicId The ID of the root topic
   * @param version The version number to retrieve
   * @param user The user requesting the topic (not used in this implementation)
   * @returns Promise resolving to the topic version or null if not found
   */
  public async getTopicVersion(
    rootTopicId: string,
    version: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic | null> {
    return this.topicRepository.findVersion(rootTopicId, version);
  }

  /**
   * Gets all versions of a topic
   * @param rootTopicId The ID of the root topic
   * @param user The user requesting the topics (not used in this implementation)
   * @returns Promise resolving to an array of all versions of the topic
   */
  public async getAllTopicVersions(
    rootTopicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic[]> {
    return this.topicRepository.findAllVersions(rootTopicId);
  }

  /**
   * Gets the latest version of a topic
   * @param rootTopicId The ID of the root topic
   * @param user The user requesting the topic (not used in this implementation)
   * @returns Promise resolving to the latest version of the topic or null if not found
   */
  public async getLatestTopicVersion(
    rootTopicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic | null> {
    return this.topicRepository.findLatestVersion(rootTopicId);
  }

  /**
   * Gets a topic tree, including the topic and all its children recursively
   * @param topicId The ID of the root topic for the tree
   * @param user The user requesting the tree (not used in this implementation)
   * @returns Promise resolving to the topic tree or null if the topic is not found
   */
  public async getTopicTree(
    topicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<TopicTree | null> {
    // Get the topic
    const topic = await this.topicRepository.findById(topicId);
    
    if (!topic) {
      return null;
    }
    
    // Get all children recursively
    const children = await this.topicRepository.findAllChildrenRecursive(topicId);
    
    // Build the tree
    const tree: TopicTree = {
      topic,
      children: []
    };
    
    // Map of topic ID to its tree node
    const topicMap = new Map<string, TopicTree>();
    topicMap.set(topic.id, tree);
    
    // For each child, find its parent in the map and add it to the parent's children
    if (children && Array.isArray(children)) {
      for (const child of children) {
        if (!child.parentTopicId) {
          continue; // Skip if no parent ID (shouldn't happen)
        }
        
        const childTree: TopicTree = {
          topic: child,
          children: []
        };
        
        const parentTree = topicMap.get(child.parentTopicId);
        if (parentTree) {
          parentTree.children.push(childTree);
        }
        
        topicMap.set(child.id, childTree);
      }
    }
    
    return tree;
  }

  /**
   * Finds the shortest path between two topics
   * @param startTopicId The ID of the starting topic
   * @param endTopicId The ID of the ending topic
   * @param user The user requesting the path (not used in this implementation)
   * @returns Promise resolving to an array of topics representing the path, or null if no path exists
   */
  public async findPath(
    startTopicId: string,
    endTopicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User
  ): Promise<Topic[] | null> {
    return this.topicRepository.findPath(startTopicId, endTopicId);
  }
} 