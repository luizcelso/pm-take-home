import { BaseEntity } from './BaseEntity';
import { ITopic } from '../interfaces/ITopic';

/**
 * Represents a subject or concept within the knowledge base
 */
export class Topic extends BaseEntity implements ITopic {
  public readonly name: string;
  public readonly content: string;
  public readonly updatedAt: Date;
  public readonly version: number;
  public readonly parentTopicId?: string;

  /**
   * Creates a new Topic instance
   * 
   * @param name The name of the topic
   * @param content The content of the topic
   * @param version The version number of the topic
   * @param parentTopicId Optional ID of the parent topic
   * @param id Optional ID for the topic (will be generated if not provided)
   * @param createdAt Optional creation date (will use current date if not provided)
   * @param updatedAt Optional update date (will use current date if not provided)
   */
  constructor(
    name: string,
    content: string,
    version = 1,
    parentTopicId?: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt);
    this.name = name;
    this.content = content;
    this.version = version;
    this.parentTopicId = parentTopicId;
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Validates that the topic is in a valid state
   * @throws Error if validation fails
   */
  public validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Topic name cannot be empty');
    }

    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Topic content cannot be empty');
    }

    if (this.version < 1) {
      throw new Error('Topic version must be at least 1');
    }
  }

  /**
   * Creates a new version of this topic with updated content
   * 
   * @param newContent The new content for the topic
   * @returns A new Topic instance with incremented version
   */
  public createNewVersion(newContent: string): Topic {
    return new Topic(
      this.name,
      newContent,
      this.version + 1,
      this.parentTopicId,
      this.id,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Converts the topic to a plain object for serialization
   */
  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      name: this.name,
      content: this.content,
      updatedAt: this.updatedAt.toISOString(),
      version: this.version,
      ...(this.parentTopicId && { parentTopicId: this.parentTopicId })
    };
  }
} 