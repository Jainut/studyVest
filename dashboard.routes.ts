import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(dashboardController.getDashboard));
router.get('/charts', asyncHandler(dashboardController.getDashboardCharts));

export default router;
