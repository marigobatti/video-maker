import { Router } from 'express';
import { OK } from 'http-status-codes';
import UserRouter from './Users';
import LoginRouter from './OAuth';

// Init router and path
const router = Router();

// Add APIs
router.use('/api/users', UserRouter);

// Add Login
router.use('/', LoginRouter);


// Export the base-router
export default router;
