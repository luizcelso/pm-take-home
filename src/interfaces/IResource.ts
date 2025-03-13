import { IEntity } from './IEntity';
import { ResourceType } from '../enums/ResourceType';

/**
 * Interface representing a Resource associated with a Topic
 */
export interface IResource extends IEntity {
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;
  updatedAt: Date;
} 