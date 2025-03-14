import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User';
import { UserRole } from '../../enums/UserRole';
import { MockUserRepository } from '../../repositories/MockUserRepository';

// Mock the MockUserRepository
jest.mock('../../repositories/MockUserRepository');

// Create a separate module for the auth middleware to use our mocked repository
const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn()
};

// Mock the constructor to return our mock
(MockUserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

// Import the auth middleware after mocking
import { authenticate, authorize, mockAuthenticate } from '../auth';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock request, response, and next function
    mockRequest = {
      headers: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });
  
  describe('authenticate', () => {
    it('should authenticate a user with valid token', async () => {
      // Arrange
      const mockUser = new User('Test User', 'test@example.com', UserRole.ADMIN, 'valid-token');
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
    
    it('should return 401 if authorization header is missing', async () => {
      // Arrange
      mockRequest.headers = {}; // No authorization header
      
      // Act
      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authorization header missing' });
    });
    
    it('should return 401 if authorization format is invalid', async () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };
      
      // Act
      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid authorization format' });
    });
    
    it('should return 401 if token is invalid', async () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act
      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('invalid-token');
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      
      const error = new Error('Database error');
      mockUserRepository.findById.mockRejectedValue(error);
      
      // Act
      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('valid-token');
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication error', error });
    });
  });
  
  describe('authorize', () => {
    it('should authorize a user with required role', () => {
      // Arrange
      const mockUser = new User('Test User', 'test@example.com', UserRole.ADMIN, 'valid-token');
      mockRequest.user = mockUser;
      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      
      // Act
      authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user does not have required role', () => {
      // Arrange
      const mockUser = new User('Test User', 'test@example.com', UserRole.VIEWER, 'valid-token');
      mockRequest.user = mockUser;
      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      
      // Act
      authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Access denied',
        requiredRoles: [UserRole.ADMIN],
        userRole: UserRole.VIEWER
      });
    });
    
    it('should return 401 if user is not authenticated', () => {
      // Arrange
      mockRequest.user = undefined;
      const authorizeMiddleware = authorize([UserRole.ADMIN]);
      
      // Act
      authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });
  });
  
  describe('mockAuthenticate', () => {
    it('should create a mock user with specified role', () => {
      // Arrange
      const mockAuthMiddleware = mockAuthenticate(UserRole.ADMIN);
      
      // Act
      mockAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.role).toBe(UserRole.ADMIN);
      expect(mockNext).toHaveBeenCalled();
    });
    
    it('should create a mock user with ADMIN role by default', () => {
      // Arrange
      const mockAuthMiddleware = mockAuthenticate();
      
      // Act
      mockAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Assert
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.role).toBe(UserRole.ADMIN);
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 