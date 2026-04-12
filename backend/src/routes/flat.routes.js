import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import {
  createFlat,
  getAllFlats,
  getFlatById,
  deleteFlat,
} from '../controllers/flat.controller.js';

const router = Router();

router.post('/',     asyncHandler(createFlat));
router.get('/',      asyncHandler(getAllFlats));
router.get('/:id',   asyncHandler(getFlatById));
router.delete('/:id', asyncHandler(deleteFlat));

export default router;