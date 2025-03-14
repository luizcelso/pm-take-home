import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { UserRole } from '../enums/UserRole';
import { MockUserRepository } from '../repositories/MockUserRepository';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: User;
  }
}

// Create a mock user repository for development
const userRepository = new MockUserRepository();

/**
 * Authentication middleware
 * Verifies the user token and sets the user in the request object
 */
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'Authorization header missing' });
      return;
    }
    
    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Invalid authorization format' });
      return;
    }
    
    const token = parts[1];
    
    // In a real application, you would verify the token
    // For this example, we'll just use the token as the user ID
    const user = await userRepository.findById(token);
    
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    // Set the user in the request object
    req.user = user;
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error', error });
  }
};

/**
 * Role-based authorization middleware
 * Checks if the user has the required role
 * @param roles Array of allowed roles
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ 
        message: 'Access denied',
        requiredRoles: roles,
        userRole: req.user.role
      });
      return;
    }
    
    next();
  };
};

/**
 * Simplified authentication middleware for development
 * Creates a mock user with the specified role
 * @param role The role to assign to the mock user
 */
export const mockAuthenticate = (role: UserRole = UserRole.ADMIN) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Create a mock user
    req.user = new User(
      `Mock ${role} User`,
      `mock-${role.toLowerCase()}@example.com`,
      role
    );
    
    next();
  };
}; 