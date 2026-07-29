import { Router } from 'express';
import * as mistakeController from '../controllers/mistake.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createMistakeSchema } from '../validations/mistake.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/recurring', asyncHandler(mistakeController.getRecurringMistakes));
router.get('/', asyncHandler(mistakeController.listMistakes));
router.post('/', validateBody(createMistakeSchema), asyncHandler(mistakeController.createMistake));
router.delete('/:id', asyncHandler(mistakeController.deleteMistake));

export default router;
