import { Topic } from '../../models/Topic';
import { User } from '../../models/User';

/**
 * Interface for topic access strategies
 * Defines methods for checking if a user can perform operations on topics
 */
export interface ITopicAccessStrategy {
  /**
   * Checks if a user can create a topic
   * @param user The user
   * @param parentTopicId Optional ID of the parent topic
   * @returns True if the user can create a topic, false otherwise
   */
  canCreateTopic(user: User, parentTopicId?: string): boolean;
  
  /**
   * Checks if a user can read a topic
   * @param user The user
   * @param topic The topic
   * @returns True if the user can read the topic, false otherwise
   */
  canReadTopic(user: User, topic: Topic): boolean;
  
  /**
   * Checks if a user can update a topic
   * @param user The user
   * @param topic The topic
   * @returns True if the user can update the topic, false otherwise
   */
  canUpdateTopic(user: User, topic: Topic): boolean;
  
  /**
   * Checks if a user can delete a topic
   * @param user The user
   * @param topic The topic
   * @returns True if the user can delete the topic, false otherwise
   */
  canDeleteTopic(user: User, topic: Topic): boolean;
} 