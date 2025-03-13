import { IEntity } from './IEntity';

/**
 * Interface representing a Topic in the knowledge base
 */
export interface ITopic extends IEntity {
  name: string;
  content: string;
  updatedAt: Date;
  version: number;
  parentTopicId?: string; // Optional, for hierarchical structure
} 