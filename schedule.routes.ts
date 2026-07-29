import { Router } from 'express';
import * as scheduleController from '../controllers/schedule.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
  createScheduleSchema,
  listSchedulesQuerySchema,
  updateScheduleSchema,
} from '../validations/schedule.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/suggestions', asyncHandler(scheduleController.getScheduleSuggestions));
router.get('/', validateQuery(listSchedulesQuerySchema), asyncHandler(scheduleController.listSchedules));
router.post('/', validateBody(createScheduleSchema), asyncHandler(scheduleController.createSchedule));
router.patch('/:id', validateBody(updateScheduleSchema), asyncHandler(scheduleController.updateSchedule));
router.delete('/:id', asyncHandler(scheduleController.deleteSchedule));

export default router;
