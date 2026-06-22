import { Router } from 'express';
import * as jobController from '../controllers/job.controller';

const router = Router();

// Job routes
router.post('/jobs', jobController.createJob);
router.get('/jobs', jobController.getJobs);
router.get('/jobs/:id', jobController.getJobById);
router.delete('/jobs/:id', jobController.cancelJob);

export default router;