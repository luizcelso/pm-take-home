import { ITopicAccessStrategy } from './ITopicAccessStrategy';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';

/**
 * Strategy for viewer users
 * Viewers can only read topics
 */
export class ViewerTopicAccessStrategy implements ITopicAccessStrategy {
  /**
   * Checks if a user can create a topic
   * @returns False, viewers cannot create topics
   */
  public canCreateTopic(): boolean {
    return false;
  }
  
  /**
   * Checks if a user can read a topic
   * @param user The user
   * @returns True if the user is a viewer
   */
  public canReadTopic(user: User): boolean {
    return user.role === UserRole.VIEWER;
  }
  
  /**
   * Checks if a user can update a topic
   * @returns False, viewers cannot update topics
   */
  public canUpdateTopic(): boolean {
    return false;
  }
  
  /**
   * Checks if a user can delete a topic
   * @returns False, viewers cannot delete topics
   */
  public canDeleteTopic(): boolean {
    return false;
  }
} 