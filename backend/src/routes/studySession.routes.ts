import { Router } from 'express';
import * as studySessionController from '../controllers/studySession.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
  createStudySessionSchema,
  listStudySessionsQuerySchema,
} from '../validations/studySession.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validateQuery(listStudySessionsQuerySchema),
  asyncHandler(studySessionController.listStudySessions),
);
router.post(
  '/',
  validateBody(createStudySessionSchema),
  asyncHandler(studySessionController.createStudySession),
);
router.delete('/:id', asyncHandler(studySessionController.deleteStudySession));

export default router;
