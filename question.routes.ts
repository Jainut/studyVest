import { Router } from 'express';
import * as questionController from '../controllers/question.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { createQuestionSchema, listQuestionsQuerySchema } from '../validations/question.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

// IMPORTANTE: /statistics precisa vir antes de /:id para não ser capturada por engano
router.get('/statistics', asyncHandler(questionController.getQuestionStatistics));
router.get('/', validateQuery(listQuestionsQuerySchema), asyncHandler(questionController.listQuestions));
router.post('/', validateBody(createQuestionSchema), asyncHandler(questionController.createQuestion));
router.delete('/:id', asyncHandler(questionController.deleteQuestion));

export default router;
