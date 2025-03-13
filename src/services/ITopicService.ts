import { Topic } from '../models/Topic';
import { User } from '../models/User';

/**
 * Interface for topic service operations
 */
export interface ITopicService {
  /**
   * Creates a new topic
   * @param name The name of the topic
   * @param content The content of the topic
   * @param user The user creating the topic
   * @param parentTopicId Optional ID of the parent topic
   * @returns Promise resolving to the created topic
   */
  createTopic(name: string, content: string, user: User, parentTopicId?: string): Promise<Topic>;
  
  /**
   * Gets a topic by ID
   * @param id The ID of the topic
   * @param user The user requesting the topic
   * @returns Promise resolving to the topic or null if not found
   */
  getTopic(id: string, user: User): Promise<Topic | null>;
  
  /**
   * Updates a topic, creating a new version
   * @param id The ID of the topic to update
   * @param content The new content for the topic
   * @param user The user updating the topic
   * @param name Optional new name for the topic
   * @returns Promise resolving to the updated topic
   */
  updateTopic(id: string, content: string, user: User, name?: string): Promise<Topic | null>;
  
  /**
   * Deletes a topic
   * @param id The ID of the topic to delete
   * @param user The user deleting the topic
   * @returns Promise resolving to true if deleted, false if not found
   */
  deleteTopic(id: string, user: User): Promise<boolean>;
  
  /**
   * Gets all topics
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of topics
   */
  getAllTopics(user: User): Promise<Topic[]>;
  
  /**
   * Gets all root topics
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of root topics
   */
  getRootTopics(user: User): Promise<Topic[]>;
  
  /**
   * Gets all child topics of a parent topic
   * @param parentId The ID of the parent topic
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of child topics
   */
  getChildTopics(parentId: string, user: User): Promise<Topic[]>;
  
  /**
   * Gets a specific version of a topic
   * @param rootTopicId The ID of the root topic
   * @param version The version number
   * @param user The user requesting the topic
   * @returns Promise resolving to the topic version or null if not found
   */
  getTopicVersion(rootTopicId: string, version: number, user: User): Promise<Topic | null>;
  
  /**
   * Gets all versions of a topic
   * @param rootTopicId The ID of the root topic
   * @param user The user requesting the topics
   * @returns Promise resolving to an array of topic versions
   */
  getAllTopicVersions(rootTopicId: string, user: User): Promise<Topic[]>;
  
  /**
   * Gets the latest version of a topic
   * @param rootTopicId The ID of the root topic
   * @param user The user requesting the topic
   * @returns Promise resolving to the latest topic version or null if not found
   */
  getLatestTopicVersion(rootTopicId: string, user: User): Promise<Topic | null>;
  
  /**
   * Gets a topic and all its child topics recursively
   * @param topicId The ID of the topic
   * @param user The user requesting the topic tree
   * @returns Promise resolving to the topic tree
   */
  getTopicTree(topicId: string, user: User): Promise<TopicTree | null>;
  
  /**
   * Finds the shortest path between two topics
   * @param startTopicId The ID of the start topic
   * @param endTopicId The ID of the end topic
   * @param user The user requesting the path
   * @returns Promise resolving to an array of topics representing the path
   */
  findPath(startTopicId: string, endTopicId: string, user: User): Promise<Topic[] | null>;
}

/**
 * Represents a topic with its child topics
 */
export interface TopicTree {
  topic: Topic;
  children: TopicTree[];
} 