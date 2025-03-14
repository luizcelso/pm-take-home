import { AdminTopicAccessStrategy } from '../AdminTopicAccessStrategy';
import { EditorTopicAccessStrategy } from '../EditorTopicAccessStrategy';
import { ViewerTopicAccessStrategy } from '../ViewerTopicAccessStrategy';
import { User } from '../../../models/User';
import { UserRole } from '../../../enums/UserRole';

describe('Access Strategies', () => {
  let adminUser: User;
  let editorUser: User;
  let viewerUser: User;
  
  beforeEach(() => {
    adminUser = new User('Admin User', 'admin@example.com', UserRole.ADMIN);
    editorUser = new User('Editor User', 'editor@example.com', UserRole.EDITOR);
    viewerUser = new User('Viewer User', 'viewer@example.com', UserRole.VIEWER);
  });
  
  describe('AdminTopicAccessStrategy', () => {
    let strategy: AdminTopicAccessStrategy;
    
    beforeEach(() => {
      strategy = new AdminTopicAccessStrategy();
    });
    
    it('should allow admins to create topics', () => {
      expect(strategy.canCreateTopic(adminUser)).toBe(true);
    });
    
    it('should not allow non-admins to create topics', () => {
      expect(strategy.canCreateTopic(editorUser)).toBe(false);
      expect(strategy.canCreateTopic(viewerUser)).toBe(false);
    });
    
    it('should allow admins to read topics', () => {
      expect(strategy.canReadTopic(adminUser)).toBe(true);
    });
    
    it('should not allow non-admins to read topics', () => {
      expect(strategy.canReadTopic(editorUser)).toBe(false);
      expect(strategy.canReadTopic(viewerUser)).toBe(false);
    });
    
    it('should allow admins to update topics', () => {
      expect(strategy.canUpdateTopic(adminUser)).toBe(true);
    });
    
    it('should not allow non-admins to update topics', () => {
      expect(strategy.canUpdateTopic(editorUser)).toBe(false);
      expect(strategy.canUpdateTopic(viewerUser)).toBe(false);
    });
    
    it('should allow admins to delete topics', () => {
      expect(strategy.canDeleteTopic(adminUser)).toBe(true);
    });
    
    it('should not allow non-admins to delete topics', () => {
      expect(strategy.canDeleteTopic(editorUser)).toBe(false);
      expect(strategy.canDeleteTopic(viewerUser)).toBe(false);
    });
  });
  
  describe('EditorTopicAccessStrategy', () => {
    let strategy: EditorTopicAccessStrategy;
    
    beforeEach(() => {
      strategy = new EditorTopicAccessStrategy();
    });
    
    it('should allow editors to create topics', () => {
      expect(strategy.canCreateTopic(editorUser)).toBe(true);
    });
    
    it('should not allow non-editors to create topics', () => {
      expect(strategy.canCreateTopic(adminUser)).toBe(false);
      expect(strategy.canCreateTopic(viewerUser)).toBe(false);
    });
    
    it('should allow editors to read topics', () => {
      expect(strategy.canReadTopic(editorUser)).toBe(true);
    });
    
    it('should not allow non-editors to read topics', () => {
      expect(strategy.canReadTopic(adminUser)).toBe(false);
      expect(strategy.canReadTopic(viewerUser)).toBe(false);
    });
    
    it('should allow editors to update topics', () => {
      expect(strategy.canUpdateTopic(editorUser)).toBe(true);
    });
    
    it('should not allow non-editors to update topics', () => {
      expect(strategy.canUpdateTopic(adminUser)).toBe(false);
      expect(strategy.canUpdateTopic(viewerUser)).toBe(false);
    });
    
    it('should not allow editors to delete topics', () => {
      expect(strategy.canDeleteTopic()).toBe(false);
    });
  });
  
  describe('ViewerTopicAccessStrategy', () => {
    let strategy: ViewerTopicAccessStrategy;
    
    beforeEach(() => {
      strategy = new ViewerTopicAccessStrategy();
    });
    
    it('should not allow viewers to create topics', () => {
      expect(strategy.canCreateTopic()).toBe(false);
    });
    
    it('should allow viewers to read topics', () => {
      expect(strategy.canReadTopic(viewerUser)).toBe(true);
    });
    
    it('should not allow non-viewers to read topics', () => {
      expect(strategy.canReadTopic(adminUser)).toBe(false);
      expect(strategy.canReadTopic(editorUser)).toBe(false);
    });
    
    it('should not allow viewers to update topics', () => {
      expect(strategy.canUpdateTopic()).toBe(false);
    });
    
    it('should not allow viewers to delete topics', () => {
      expect(strategy.canDeleteTopic()).toBe(false);
    });
  });
}); 