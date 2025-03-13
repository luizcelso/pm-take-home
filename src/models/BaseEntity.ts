import { IEntity } from '../interfaces/IEntity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract base class for all entities in the system
 * Implements common properties and methods
 */
export abstract class BaseEntity implements IEntity {
  public readonly id: string;
  public readonly createdAt: Date;

  /**
   * Constructor for the base entity
   * @param id Optional ID (will generate UUID if not provided)
   * @param createdAt Optional creation date (will use current date if not provided)
   */
  constructor(id?: string, createdAt?: Date) {
    this.id = id || uuidv4();
    this.createdAt = createdAt || new Date();
  }

  /**
   * Validates that the entity is in a valid state
   * @throws Error if validation fails
   */
  public abstract validate(): void;

  /**
   * Converts the entity to a plain object for serialization
   */
  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString()
    };
  }
} 