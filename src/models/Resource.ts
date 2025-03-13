import { BaseEntity } from './BaseEntity';
import { IResource } from '../interfaces/IResource';
import { ResourceType } from '../enums/ResourceType';

/**
 * Represents an external link or document associated with a topic
 */
export class Resource extends BaseEntity implements IResource {
  public readonly topicId: string;
  public readonly url: string;
  public readonly description: string;
  public readonly type: ResourceType;
  public readonly updatedAt: Date;

  /**
   * Creates a new Resource instance
   * 
   * @param topicId The ID of the topic this resource is associated with
   * @param url The URL of the resource
   * @param description A description of the resource
   * @param type The type of resource
   * @param id Optional ID for the resource (will be generated if not provided)
   * @param createdAt Optional creation date (will use current date if not provided)
   * @param updatedAt Optional update date (will use current date if not provided)
   */
  constructor(
    topicId: string,
    url: string,
    description: string,
    type: ResourceType,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt);
    this.topicId = topicId;
    this.url = url;
    this.description = description;
    this.type = type;
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Validates that the resource is in a valid state
   * @throws Error if validation fails
   */
  public validate(): void {
    if (!this.topicId || this.topicId.trim().length === 0) {
      throw new Error('Resource must be associated with a topic');
    }

    if (!this.url || this.url.trim().length === 0) {
      throw new Error('Resource URL cannot be empty');
    }

    try {
      // Validate URL format
      new URL(this.url);
    } catch (error) {
      throw new Error('Resource URL is not valid');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Resource description cannot be empty');
    }

    if (!Object.values(ResourceType).includes(this.type)) {
      throw new Error(`Resource type must be one of: ${Object.values(ResourceType).join(', ')}`);
    }
  }

  /**
   * Updates the resource with new information
   * 
   * @param url New URL for the resource
   * @param description New description for the resource
   * @param type New type for the resource
   * @returns A new Resource instance with updated information
   */
  public update(
    url: string = this.url,
    description: string = this.description,
    type: ResourceType = this.type
  ): Resource {
    return new Resource(
      this.topicId,
      url,
      description,
      type,
      this.id,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Converts the resource to a plain object for serialization
   */
  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      topicId: this.topicId,
      url: this.url,
      description: this.description,
      type: this.type,
      updatedAt: this.updatedAt.toISOString()
    };
  }
} 