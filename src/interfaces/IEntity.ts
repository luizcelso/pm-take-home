/**
 * Base interface for all entities in the system
 * Provides common properties that all entities should have
 */
export interface IEntity {
  id: string;
  createdAt: Date;
} 