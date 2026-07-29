import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { completeReviewSchema } from '../validations/review.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/today', asyncHandler(reviewController.getTodayReviews));
router.get('/', asyncHandler(reviewController.listReviews));
router.patch(
  '/:id/complete',
  validateBody(completeReviewSchema),
  asyncHandler(reviewController.completeReviewController),
);

export default router;
