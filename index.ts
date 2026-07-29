import { Router } from 'express';
import authRoutes from './auth.routes';
import subjectRoutes from './subject.routes';
import topicRoutes from './topic.routes';
import studySessionRoutes from './studySession.routes';
import reviewRoutes from './review.routes';
import dashboardRoutes from './dashboard.routes';
import questionRoutes from './question.routes';
import mistakeRoutes from './mistake.routes';
import essayRoutes from './essay.routes';
import scheduleRoutes from './schedule.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/subjects', subjectRoutes);
router.use('/topics', topicRoutes);
router.use('/study-sessions', studySessionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/questions', questionRoutes);
router.use('/mistakes', mistakeRoutes);
router.use('/essays', essayRoutes);
router.use('/schedules', scheduleRoutes);

export default router;
