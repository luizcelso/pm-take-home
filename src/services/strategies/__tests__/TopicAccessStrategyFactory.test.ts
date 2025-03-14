import { TopicAccessStrategyFactory } from '../TopicAccessStrategyFactory';
import { AdminTopicAccessStrategy } from '../AdminTopicAccessStrategy';
import { EditorTopicAccessStrategy } from '../EditorTopicAccessStrategy';
import { ViewerTopicAccessStrategy } from '../ViewerTopicAccessStrategy';
import { User } from '../../../models/User';
import { UserRole } from '../../../enums/UserRole';

describe('TopicAccessStrategyFactory', () => {
  it('should return AdminTopicAccessStrategy for admin users', () => {
    // Arrange
    const adminUser = new User('Admin User', 'admin@example.com', UserRole.ADMIN);
    
    // Act
    const strategy = TopicAccessStrategyFactory.getStrategy(adminUser);
    
    // Assert
    expect(strategy).toBeInstanceOf(AdminTopicAccessStrategy);
  });
  
  it('should return EditorTopicAccessStrategy for editor users', () => {
    // Arrange
    const editorUser = new User('Editor User', 'editor@example.com', UserRole.EDITOR);
    
    // Act
    const strategy = TopicAccessStrategyFactory.getStrategy(editorUser);
    
    // Assert
    expect(strategy).toBeInstanceOf(EditorTopicAccessStrategy);
  });
  
  it('should return ViewerTopicAccessStrategy for viewer users', () => {
    // Arrange
    const viewerUser = new User('Viewer User', 'viewer@example.com', UserRole.VIEWER);
    
    // Act
    const strategy = TopicAccessStrategyFactory.getStrategy(viewerUser);
    
    // Assert
    expect(strategy).toBeInstanceOf(ViewerTopicAccessStrategy);
  });
  
  it('should throw an error for unknown user roles', () => {
    // Arrange
    const invalidUser = new User('Invalid User', 'invalid@example.com', 'INVALID_ROLE' as UserRole);
    
    // Act & Assert
    expect(() => TopicAccessStrategyFactory.getStrategy(invalidUser))
      .toThrow(`No strategy found for role ${invalidUser.role}`);
  });
}); 