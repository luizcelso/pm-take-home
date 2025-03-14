import { Request, Response } from 'express';
import { SecureTopicService } from '../services/SecureTopicService';

/**
 * Controller for Topic-related operations
 */
export class TopicController {
  private topicService: SecureTopicService;
  
  /**
   * Creates a new TopicController instance
   * @param topicService The topic service to use
   */
  constructor(topicService?: SecureTopicService) {
    this.topicService = topicService || new SecureTopicService();
  }
  
  /**
   * Creates a new topic
   * @param req Express request
   * @param res Express response
   */
  public createTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, content, parentTopicId } = req.body;
      
      if (!name || !content) {
        res.status(400).json({ message: 'Name and content are required' });
        return;
      }
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const topic = await this.topicService.createTopic(
        name,
        content,
        req.user,
        parentTopicId
      );
      
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error creating topic', 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  };
  
  /**
   * Gets a topic by ID
   * @param req Express request
   * @param res Express response
   */
  public getTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const topic = await this.topicService.getTopic(id, req.user);
      
      if (!topic) {
        res.status(404).json({ message: `Topic with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(topic);
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error retrieving topic', 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  };
  
  /**
   * Updates a topic
   * @param req Express request
   * @param res Express response
   */
  public updateTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content, name } = req.body;
      
      if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
      }
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const topic = await this.topicService.updateTopic(
        id,
        content,
        req.user,
        name
      );
      
      if (!topic) {
        res.status(404).json({ message: `Topic with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(topic);
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error updating topic', 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  };
  
  /**
   * Deletes a topic
   * @param req Express request
   * @param res Express response
   */
  public deleteTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const deleted = await this.topicService.deleteTopic(id, req.user);
      
      if (!deleted) {
        res.status(404).json({ message: `Topic with ID ${id} not found` });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof Error && error.message.includes('child topics')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error deleting topic', 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  };
  
  /**
   * Gets all topics
   * @param req Express request
   * @param res Express response
   */
  public getAllTopics = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const topics = await this.topicService.getAllTopics(req.user);
      
      res.status(200).json(topics);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving topics', 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  /**
   * Gets all root topics
   * @param req Express request
   * @param res Express response
   */
  public getRootTopics = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const topics = await this.topicService.getRootTopics(req.user);
      
      res.status(200).json(topics);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving root topics', 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  /**
   * Gets child topics of a parent topic
   * @param req Express request
   * @param res Express response
   */
  public getChildTopics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { parentId } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const topics = await this.topicService.getChildTopics(parentId, req.user);
      
      res.status(200).json(topics);
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error retrieving child topics', 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  };
  
  /**
   * Gets a topic tree
   * @param req Express request
   * @param res Express response
   */
  public getTopicTree = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const tree = await this.topicService.getTopicTree(id, req.user);
      
      if (!tree) {
        res.status(404).json({ message: `Topic with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(tree);
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error retrieving topic tree', 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  };
} 