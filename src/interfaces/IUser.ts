import { IEntity } from './IEntity';
import { UserRole } from '../enums/UserRole';

/**
 * Interface representing a User in the system
 */
export interface IUser extends IEntity {
  name: string;
  email: string;
  role: UserRole;
} 