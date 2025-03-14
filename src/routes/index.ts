import { Router } from 'express';
import topicRoutes from './topicRoutes';

const router = Router();

// Mount routes
router.use('/topics', topicRoutes);

export default router; 