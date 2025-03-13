import { BaseEntity } from './BaseEntity';
import { IUser } from '../interfaces/IUser';
import { UserRole } from '../enums/UserRole';
import * as crypto from 'crypto';

/**
 * Represents a user who can access the knowledge base
 */
export class User extends BaseEntity implements IUser {
  public readonly name: string;
  public readonly email: string;
  public readonly role: UserRole;
  private readonly passwordHash?: string;
  private readonly passwordSalt?: string;

  /**
   * Creates a new User instance
   * 
   * @param name The name of the user
   * @param email The email of the user
   * @param role The role of the user
   * @param id Optional ID for the user (will be generated if not provided)
   * @param createdAt Optional creation date (will use current date if not provided)
   * @param passwordHash Optional password hash (for existing users)
   * @param passwordSalt Optional password salt (for existing users)
   */
  constructor(
    name: string,
    email: string,
    role: UserRole = UserRole.VIEWER,
    id?: string,
    createdAt?: Date,
    passwordHash?: string,
    passwordSalt?: string
  ) {
    super(id, createdAt);
    this.name = name;
    this.email = email.toLowerCase();
    this.role = role;
    this.passwordHash = passwordHash;
    this.passwordSalt = passwordSalt;
  }

  /**
   * Validates that the user is in a valid state
   * @throws Error if validation fails
   */
  public validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }

    if (!this.email || this.email.trim().length === 0) {
      throw new Error('User email cannot be empty');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('User email is not valid');
    }

    if (!Object.values(UserRole).includes(this.role)) {
      throw new Error(`User role must be one of: ${Object.values(UserRole).join(', ')}`);
    }
  }

  /**
   * Creates a new user with a password
   * 
   * @param name The name of the user
   * @param email The email of the user
   * @param password The password for the user
   * @param role The role of the user
   * @returns A new User instance with password hash and salt
   */
  public static createWithPassword(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.VIEWER
  ): User {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = User.hashPassword(password, salt);

    return new User(name, email, role, undefined, undefined, hash, salt);
  }

  /**
   * Verifies if the provided password matches the stored hash
   * 
   * @param password The password to verify
   * @returns True if the password matches, false otherwise
   */
  public verifyPassword(password: string): boolean {
    if (!this.passwordHash || !this.passwordSalt) {
      return false;
    }

    const hash = User.hashPassword(password, this.passwordSalt);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(this.passwordHash, 'hex')
    );
  }

  /**
   * Updates the user's role
   * 
   * @param newRole The new role for the user
   * @returns A new User instance with the updated role
   */
  public updateRole(newRole: UserRole): User {
    return new User(
      this.name,
      this.email,
      newRole,
      this.id,
      this.createdAt,
      this.passwordHash,
      this.passwordSalt
    );
  }

  /**
   * Hashes a password with the provided salt
   * 
   * @param password The password to hash
   * @param salt The salt to use
   * @returns The hashed password
   */
  private static hashPassword(password: string, salt: string): string {
    return crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
  }

  /**
   * Converts the user to a plain object for serialization
   * Note: Password hash and salt are not included for security
   */
  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      name: this.name,
      email: this.email,
      role: this.role
    };
  }
} 