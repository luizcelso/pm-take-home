import { Router } from 'express';
import topicRoutes from './topicRoutes';
// import userRoutes from './userRoutes'; // Uncomment when user routes are implemented
// import resourceRoutes from './resourceRoutes'; // Uncomment when resource routes are implemented

const router = Router();

// Mount routes
router.use('/topics', topicRoutes);
// router.use('/users', userRoutes); // Uncomment when user routes are implemented
// router.use('/resources', resourceRoutes); // Uncomment when resource routes are implemented

export default router; 