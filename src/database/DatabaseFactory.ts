import { IDatabase } from './IDatabase';
import { JsonDatabase } from './JsonDatabase';
import { IEntity } from '../interfaces/IEntity';

/**
 * Factory for creating and managing database instances
 * Ensures only one database instance exists per entity type
 */
export class DatabaseFactory {
  private static instances: Map<string, IDatabase<IEntity>> = new Map();

  /**
   * Gets a database instance for the specified entity type
   * Creates a new instance if one doesn't exist
   * 
   * @param entityName The name of the entity type
   * @returns A database instance for the entity type
   */
  public static getDatabase<T extends IEntity>(entityName: string): IDatabase<T> {
    if (!this.instances.has(entityName)) {
      this.instances.set(entityName, new JsonDatabase<T>(entityName));
    }

    return this.instances.get(entityName) as IDatabase<T>;
  }

  /**
   * Clears all database instances
   * Useful for testing
   */
  public static clearDatabases(): void {
    this.instances.clear();
  }
} 