import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../enums/UserRole';

const router = Router();
const topicController = new TopicController();

// Get all topics
router.get('/', authenticate, topicController.getAllTopics);

// Get all root topics
router.get('/root', authenticate, topicController.getRootTopics);

// Create a new topic
router.post('/', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.EDITOR]), 
  topicController.createTopic
);

// Get a topic by ID
router.get('/:id', authenticate, topicController.getTopic);

// Update a topic
router.put('/:id', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.EDITOR]), 
  topicController.updateTopic
);

// Delete a topic
router.delete('/:id', 
  authenticate, 
  authorize([UserRole.ADMIN]), 
  topicController.deleteTopic
);

// Get child topics of a parent topic
router.get('/:parentId/children', authenticate, topicController.getChildTopics);

// Get a topic tree
router.get('/:id/tree', authenticate, topicController.getTopicTree);

export default router; 