import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import {
  createRoom,
  getRooms,
  deleteRoom,
} from '../controllers/room.controller.js';

const router = Router();

router.post('/',      asyncHandler(createRoom));
router.get('/',       asyncHandler(getRooms));
router.delete('/:id', asyncHandler(deleteRoom));

export default router;