import { Router } from 'express';
import * as essayController from '../controllers/essay.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createEssaySchema, updateEssaySchema } from '../validations/essay.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/evolution', asyncHandler(essayController.getEssayEvolution));
router.get('/', asyncHandler(essayController.listEssays));
router.get('/:id', asyncHandler(essayController.getEssay));
router.post('/', validateBody(createEssaySchema), asyncHandler(essayController.createEssay));
router.patch('/:id', validateBody(updateEssaySchema), asyncHandler(essayController.updateEssay));
router.delete('/:id', asyncHandler(essayController.deleteEssay));

export default router;
