import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import {
  createTenant,
  getAllTenants,
  getTenantById,
  deleteTenant,
  assignTenant,
  unassignTenant,
} from '../controllers/tenant.controller.js';

const router = Router();

router.post('/assign',    asyncHandler(assignTenant));
router.post('/unassign',  asyncHandler(unassignTenant));
router.post('/',          asyncHandler(createTenant));
router.get('/',           asyncHandler(getAllTenants));
router.get('/:id',        asyncHandler(getTenantById));
router.delete('/:id',     asyncHandler(deleteTenant));

export default router;