import { BaseRepository } from './BaseRepository';
import { Topic } from '../models/Topic';

/**
 * Repository for Topic entities
 */
export class TopicRepository extends BaseRepository<Topic> {
  /**
   * Creates a new TopicRepository instance
   */
  constructor() {
    super('Topic');
  }

  /**
   * Finds topics by parent topic ID
   * @param parentTopicId The ID of the parent topic
   * @returns Promise resolving to an array of child topics
   */
  public async findByParentId(parentTopicId: string): Promise<Topic[]> {
    return this.query(topic => topic.parentTopicId === parentTopicId);
  }

  /**
   * Finds root topics (topics without a parent)
   * @returns Promise resolving to an array of root topics
   */
  public async findRootTopics(): Promise<Topic[]> {
    return this.query(topic => !topic.parentTopicId);
  }

  /**
   * Finds topics by name (case-insensitive partial match)
   * @param name The name to search for
   * @returns Promise resolving to an array of matching topics
   */
  public async findByName(name: string): Promise<Topic[]> {
    const lowerName = name.toLowerCase();
    return this.query(topic => topic.name.toLowerCase().includes(lowerName));
  }

  /**
   * Creates a new version of a topic
   * @param id The ID of the topic to version
   * @param newContent The new content for the topic
   * @returns Promise resolving to the new version of the topic
   */
  public async createNewVersion(id: string, newContent: string): Promise<Topic | null> {
    const topic = await this.findById(id);
    
    if (!topic) {
      return null;
    }
    
    const newVersion = topic.createNewVersion(newContent);
    return this.update(id, newVersion);
  }
} 