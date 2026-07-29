import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  analyzeMistakesSchema,
  explainTopicSchema,
  generateExercisesSchema,
} from '../validations/ai.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authMiddleware);

router.post('/weekly-plan', asyncHandler(aiController.createWeeklyPlan));
router.post('/priorities', asyncHandler(aiController.createPrioritySuggestion));
router.post(
  '/explain',
  validateBody(explainTopicSchema),
  asyncHandler(aiController.createTopicExplanation),
);
router.post(
  '/exercises',
  validateBody(generateExercisesSchema),
  asyncHandler(aiController.createExercises),
);
router.post(
  '/analyze-mistakes',
  validateBody(analyzeMistakesSchema),
  asyncHandler(aiController.createMistakeAnalysis),
);

export default router;
