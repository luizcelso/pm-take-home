import fs from 'fs/promises';
import path from 'path';
import { IDatabase } from './IDatabase';
import { IEntity } from '../interfaces/IEntity';

/**
 * JSON file-based database implementation
 * Stores entities in JSON files for persistence
 */
export class JsonDatabase<T extends IEntity> implements IDatabase<T> {
  private readonly filePath: string;
  private data: Map<string, T> = new Map();
  private initialized = false;

  /**
   * Creates a new JsonDatabase instance
   * @param entityName The name of the entity type (used for the filename)
   * @param dataDir The directory where data files are stored
   */
  constructor(
    private readonly entityName: string,
    private readonly dataDir: string = path.join(process.cwd(), 'src', 'database', 'data')
  ) {
    this.filePath = path.join(this.dataDir, `${entityName.toLowerCase()}.json`);
  }

  /**
   * Initializes the database by loading data from the JSON file
   * Creates the file if it doesn't exist
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure the data directory exists
      await fs.mkdir(this.dataDir, { recursive: true });

      try {
        // Try to read the file
        const fileContent = await fs.readFile(this.filePath, 'utf-8');
        const entities = JSON.parse(fileContent) as T[];
        
        // Populate the in-memory map
        this.data = new Map(entities.map(entity => [entity.id, entity]));
      } catch (error) {
        // If the file doesn't exist, create it with an empty array
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        } else {
          throw error;
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error(`Error initializing database for ${this.entityName}:`, error);
      throw new Error(`Failed to initialize database for ${this.entityName}`);
    }
  }

  /**
   * Saves the current state of the database to the JSON file
   */
  private async saveToFile(): Promise<void> {
    try {
      const entities = Array.from(this.data.values());
      await fs.writeFile(this.filePath, JSON.stringify(entities, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error saving database for ${this.entityName}:`, error);
      throw new Error(`Failed to save database for ${this.entityName}`);
    }
  }

  /**
   * Finds all entities in the database
   */
  public async findAll(): Promise<T[]> {
    await this.initialize();
    return Array.from(this.data.values());
  }

  /**
   * Finds an entity by ID
   * @param id The ID of the entity to find
   */
  public async findById(id: string): Promise<T | null> {
    await this.initialize();
    return this.data.get(id) || null;
  }

  /**
   * Creates a new entity in the database
   * @param entity The entity to create
   */
  public async create(entity: T): Promise<T> {
    await this.initialize();
    
    if (this.data.has(entity.id)) {
      throw new Error(`Entity with ID ${entity.id} already exists`);
    }
    
    this.data.set(entity.id, entity);
    await this.saveToFile();
    
    return entity;
  }

  /**
   * Updates an existing entity in the database
   * @param id The ID of the entity to update
   * @param entity The updated entity
   */
  public async update(id: string, entity: T): Promise<T | null> {
    await this.initialize();
    
    if (!this.data.has(id)) {
      return null;
    }
    
    // Ensure the entity ID matches the provided ID
    if (entity.id !== id) {
      throw new Error('Entity ID does not match the provided ID');
    }
    
    this.data.set(id, entity);
    await this.saveToFile();
    
    return entity;
  }

  /**
   * Deletes an entity from the database
   * @param id The ID of the entity to delete
   */
  public async delete(id: string): Promise<boolean> {
    await this.initialize();
    
    if (!this.data.has(id)) {
      return false;
    }
    
    this.data.delete(id);
    await this.saveToFile();
    
    return true;
  }

  /**
   * Queries entities based on a predicate function
   * @param queryFn Function that returns true for entities that match the query
   */
  public async query(queryFn: (entity: T) => boolean): Promise<T[]> {
    await this.initialize();
    return Array.from(this.data.values()).filter(queryFn);
  }
} 