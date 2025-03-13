import { IRepository } from './IRepository';
import { IDatabase } from '../database/IDatabase';
import { DatabaseFactory } from '../database/DatabaseFactory';
import { BaseEntity } from '../models/BaseEntity';

/**
 * Base repository implementation for entity operations
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected readonly database: IDatabase<T>;

  /**
   * Creates a new BaseRepository instance
   * @param entityName The name of the entity type
   */
  constructor(entityName: string) {
    this.database = DatabaseFactory.getDatabase<T>(entityName);
  }

  /**
   * Finds all entities
   */
  public async findAll(): Promise<T[]> {
    return this.database.findAll();
  }

  /**
   * Finds an entity by ID
   * @param id The ID of the entity to find
   */
  public async findById(id: string): Promise<T | null> {
    return this.database.findById(id);
  }

  /**
   * Creates a new entity
   * @param entity The entity to create
   */
  public async create(entity: T): Promise<T> {
    // Validate the entity before creating
    entity.validate();
    return this.database.create(entity);
  }

  /**
   * Updates an existing entity
   * @param id The ID of the entity to update
   * @param entity The updated entity
   */
  public async update(id: string, entity: T): Promise<T | null> {
    // Validate the entity before updating
    entity.validate();
    return this.database.update(id, entity);
  }

  /**
   * Deletes an entity by ID
   * @param id The ID of the entity to delete
   */
  public async delete(id: string): Promise<boolean> {
    return this.database.delete(id);
  }

  /**
   * Queries entities based on a predicate function
   * @param queryFn Function that returns true for entities that match the query
   */
  protected async query(queryFn: (entity: T) => boolean): Promise<T[]> {
    return this.database.query(queryFn);
  }
} 