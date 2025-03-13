import { ITopicAccessStrategy } from './ITopicAccessStrategy';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';

/**
 * Strategy for admin users
 * Admins have full access to all topics
 */
export class AdminTopicAccessStrategy implements ITopicAccessStrategy {
  /**
   * Checks if a user can create a topic
   * @param user The user
   * @returns True if the user is an admin
   */
  public canCreateTopic(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }
  
  /**
   * Checks if a user can read a topic
   * @param user The user
   * @returns True if the user is an admin
   */
  public canReadTopic(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }
  
  /**
   * Checks if a user can update a topic
   * @param user The user
   * @returns True if the user is an admin
   */
  public canUpdateTopic(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }
  
  /**
   * Checks if a user can delete a topic
   * @param user The user
   * @returns True if the user is an admin
   */
  public canDeleteTopic(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }
} 