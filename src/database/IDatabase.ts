/**
 * Interface for database operations
 * Provides methods for CRUD operations on entities
 */
export interface IDatabase<T> {
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
  
  /**
   * Finds entities by a query function
   * @param queryFn Function that returns true for entities that match the query
   * @returns Promise resolving to an array of matching entities
   */
  query(queryFn: (entity: T) => boolean): Promise<T[]>;
} 