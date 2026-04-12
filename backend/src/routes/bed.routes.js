import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import {
  createBed,
  getBeds,
  updateBedStatus,
} from '../controllers/bed.controller.js';

const router = Router();

router.post('/',           asyncHandler(createBed));
router.get('/',            asyncHandler(getBeds));
router.patch('/:id/status', asyncHandler(updateBedStatus));

export default router;