import { ITopicAccessStrategy } from './ITopicAccessStrategy';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';

/**
 * Strategy for editor users
 * Editors can create, read, and update topics, but not delete them
 */
export class EditorTopicAccessStrategy implements ITopicAccessStrategy {
  /**
   * Checks if a user can create a topic
   * @param user The user
   * @returns True if the user is an editor
   */
  public canCreateTopic(user: User): boolean {
    return user.role === UserRole.EDITOR;
  }
  
  /**
   * Checks if a user can read a topic
   * @param user The user
   * @returns True if the user is an editor
   */
  public canReadTopic(user: User): boolean {
    return user.role === UserRole.EDITOR;
  }
  
  /**
   * Checks if a user can update a topic
   * @param user The user
   * @returns True if the user is an editor
   */
  public canUpdateTopic(user: User): boolean {
    return user.role === UserRole.EDITOR;
  }
  
  /**
   * Checks if a user can delete a topic
   * @returns False, editors cannot delete topics
   */
  public canDeleteTopic(): boolean {
    return false;
  }
} 