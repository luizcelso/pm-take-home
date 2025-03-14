import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../enums/UserRole';

const router = Router();
const topicController = new TopicController();

// Get all topics
router.get('/', authenticate, topicController.getAllTopics.bind(topicController));

// Get all root topics
router.get('/root', authenticate, topicController.getRootTopics.bind(topicController));

// Create a new topic
router.post('/', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.EDITOR]), 
  topicController.createTopic.bind(topicController)
);

// Get a topic by ID
router.get('/:id', authenticate, topicController.getTopic.bind(topicController));

// Update a topic
router.put('/:id', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.EDITOR]), 
  topicController.updateTopic.bind(topicController)
);

// Delete a topic
router.delete('/:id', 
  authenticate, 
  authorize([UserRole.ADMIN]), 
  topicController.deleteTopic.bind(topicController)
);

// Get child topics of a parent topic
router.get('/:parentId/children', authenticate, topicController.getChildTopics.bind(topicController));

// Get a topic tree
router.get('/:id/tree', authenticate, topicController.getTopicTree.bind(topicController));

export default router; 