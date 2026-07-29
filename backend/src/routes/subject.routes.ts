import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  createSubjectSchema,
  updateSubjectSchema,
} from '../validations/subject.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(subjectController.listSubjects));
router.post('/', validateBody(createSubjectSchema), asyncHandler(subjectController.createSubject));
router.get('/:id', asyncHandler(subjectController.getSubject));
router.patch(
  '/:id',
  validateBody(updateSubjectSchema),
  asyncHandler(subjectController.updateSubject),
);
router.delete('/:id', asyncHandler(subjectController.deleteSubject));

export default router;
