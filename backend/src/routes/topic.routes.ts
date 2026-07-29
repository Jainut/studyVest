import { Router } from 'express';
import * as topicController from '../controllers/topic.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
  createTopicSchema,
  listTopicsQuerySchema,
  updateTopicSchema,
} from '../validations/topic.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authMiddleware);

router.get('/', validateQuery(listTopicsQuerySchema), asyncHandler(topicController.listTopics));
router.post('/', validateBody(createTopicSchema), asyncHandler(topicController.createTopic));
router.get('/:id', asyncHandler(topicController.getTopic));
router.patch(
  '/:id',
  validateBody(updateTopicSchema),
  asyncHandler(topicController.updateTopic),
);
router.post('/:id/complete', asyncHandler(topicController.completeTopic));
router.delete('/:id', asyncHandler(topicController.deleteTopic));

export default router;
