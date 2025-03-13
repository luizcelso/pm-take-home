import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';
import { UserRole } from '../enums/UserRole';

/**
 * Repository for User entities
 */
export class UserRepository extends BaseRepository<User> {
  /**
   * Creates a new UserRepository instance
   */
  constructor() {
    super('User');
  }

  /**
   * Finds a user by email
   * @param email The email to search for
   * @returns Promise resolving to the user or null if not found
   */
  public async findByEmail(email: string): Promise<User | null> {
    const users = await this.query(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
    
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Finds users by role
   * @param role The role to search for
   * @returns Promise resolving to an array of users with the specified role
   */
  public async findByRole(role: UserRole): Promise<User[]> {
    return this.query(user => user.role === role);
  }

  /**
   * Finds users by name (case-insensitive partial match)
   * @param name The name to search for
   * @returns Promise resolving to an array of matching users
   */
  public async findByName(name: string): Promise<User[]> {
    const lowerName = name.toLowerCase();
    return this.query(user => user.name.toLowerCase().includes(lowerName));
  }

  /**
   * Creates a new user with a password
   * @param name The name of the user
   * @param email The email of the user
   * @param password The password for the user
   * @param role The role of the user
   * @returns Promise resolving to the created user
   */
  public async createWithPassword(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.VIEWER
  ): Promise<User> {
    // Check if a user with the same email already exists
    const existingUser = await this.findByEmail(email);
    
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }
    
    const user = User.createWithPassword(name, email, password, role);
    return this.create(user);
  }

  /**
   * Updates a user's role
   * @param id The ID of the user to update
   * @param newRole The new role for the user
   * @returns Promise resolving to the updated user
   */
  public async updateRole(id: string, newRole: UserRole): Promise<User | null> {
    const user = await this.findById(id);
    
    if (!user) {
      return null;
    }
    
    const updatedUser = user.updateRole(newRole);
    return this.update(id, updatedUser);
  }

  /**
   * Authenticates a user with email and password
   * @param email The email of the user
   * @param password The password to verify
   * @returns Promise resolving to the user if authentication succeeds, null otherwise
   */
  public async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    return user.verifyPassword(password) ? user : null;
  }
} 