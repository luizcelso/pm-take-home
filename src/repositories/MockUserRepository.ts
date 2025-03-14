import { User } from '../models/User';
import { UserRole } from '../enums/UserRole';

/**
 * Mock user repository for development purposes
 */
export class MockUserRepository {
  private users: User[];
  
  constructor() {
    // Create some mock users
    this.users = [
      new User('Admin User', 'admin@example.com', UserRole.ADMIN, 'admin-id'),
      new User('Editor User', 'editor@example.com', UserRole.EDITOR, 'editor-id'),
      new User('Viewer User', 'viewer@example.com', UserRole.VIEWER, 'viewer-id')
    ];
  }
  
  /**
   * Finds a user by ID
   * @param id The ID of the user to find
   * @returns The user or null if not found
   */
  public async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }
  
  /**
   * Finds a user by email
   * @param email The email of the user to find
   * @returns The user or null if not found
   */
  public async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }
  
  /**
   * Gets all users
   * @returns All users
   */
  public async findAll(): Promise<User[]> {
    return [...this.users];
  }
} 