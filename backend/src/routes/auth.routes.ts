import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validations/auth.validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', validateBody(registerSchema), asyncHandler(authController.register));
router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.me));
router.patch(
  '/me',
  authMiddleware,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

export default router;
