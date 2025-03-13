import { BaseRepository } from './BaseRepository';
import { Resource } from '../models/Resource';
import { ResourceType } from '../enums/ResourceType';

/**
 * Repository for Resource entities
 */
export class ResourceRepository extends BaseRepository<Resource> {
  /**
   * Creates a new ResourceRepository instance
   */
  constructor() {
    super('Resource');
  }

  /**
   * Finds resources by topic ID
   * @param topicId The ID of the topic
   * @returns Promise resolving to an array of resources for the topic
   */
  public async findByTopicId(topicId: string): Promise<Resource[]> {
    return this.query(resource => resource.topicId === topicId);
  }

  /**
   * Finds resources by type
   * @param type The type of resource
   * @returns Promise resolving to an array of resources of the specified type
   */
  public async findByType(type: ResourceType): Promise<Resource[]> {
    return this.query(resource => resource.type === type);
  }

  /**
   * Finds resources by description (case-insensitive partial match)
   * @param description The description to search for
   * @returns Promise resolving to an array of matching resources
   */
  public async findByDescription(description: string): Promise<Resource[]> {
    const lowerDescription = description.toLowerCase();
    return this.query(resource => 
      resource.description.toLowerCase().includes(lowerDescription)
    );
  }

  /**
   * Updates a resource
   * @param id The ID of the resource to update
   * @param url The new URL for the resource
   * @param description The new description for the resource
   * @param type The new type for the resource
   * @returns Promise resolving to the updated resource
   */
  public async updateResource(
    id: string,
    url?: string,
    description?: string,
    type?: ResourceType
  ): Promise<Resource | null> {
    const resource = await this.findById(id);
    
    if (!resource) {
      return null;
    }
    
    const updatedResource = resource.update(
      url || resource.url,
      description || resource.description,
      type || resource.type
    );
    
    return this.update(id, updatedResource);
  }
} 