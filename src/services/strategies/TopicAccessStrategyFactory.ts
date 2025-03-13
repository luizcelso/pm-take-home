import { ITopicAccessStrategy } from './ITopicAccessStrategy';
import { AdminTopicAccessStrategy } from './AdminTopicAccessStrategy';
import { EditorTopicAccessStrategy } from './EditorTopicAccessStrategy';
import { ViewerTopicAccessStrategy } from './ViewerTopicAccessStrategy';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';

/**
 * Factory for creating topic access strategies based on user role
 */
export class TopicAccessStrategyFactory {
  private static readonly strategies: Map<UserRole, ITopicAccessStrategy> = new Map([
    [UserRole.ADMIN, new AdminTopicAccessStrategy()],
    [UserRole.EDITOR, new EditorTopicAccessStrategy()],
    [UserRole.VIEWER, new ViewerTopicAccessStrategy()]
  ]);

  /**
   * Gets the appropriate strategy for a user
   * @param user The user
   * @returns The appropriate strategy for the user's role
   */
  public static getStrategy(user: User): ITopicAccessStrategy {
    const strategy = this.strategies.get(user.role);
    
    if (!strategy) {
      throw new Error(`No strategy found for role ${user.role}`);
    }
    
    return strategy;
  }
} 