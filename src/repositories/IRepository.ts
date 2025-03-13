import { IEntity } from '../interfaces/IEntity';

/**
 * Generic repository interface for entity operations
 */
export interface IRepository<T extends IEntity> {
  /**
   * Finds all entities
   * @returns Promise resolving to an array of entities
   */
  findAll(): Promise<T[]>;
  
  /**
   * Finds an entity by ID
   * @param id The ID of the entity to find
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: string): Promise<T | null>;
  
  /**
   * Creates a new entity
   * @param entity The entity to create
   * @returns Promise resolving to the created entity
   */
  create(entity: T): Promise<T>;
  
  /**
   * Updates an existing entity
   * @param id The ID of the entity to update
   * @param entity The updated entity
   * @returns Promise resolving to the updated entity or null if not found
   */
  update(id: string, entity: T): Promise<T | null>;
  
  /**
   * Deletes an entity by ID
   * @param id The ID of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
} 