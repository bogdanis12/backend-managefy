import { Router } from "express";
import { permissionToChangeShifts } from '../middlewares/permissionToChangeShifts.middleware';

import ShiftController from '../controllers/Shift.controller';


const router = Router();

router
    .route('/')
    .get(ShiftController.getAllShifts)
    .post(ShiftController.createShift)

router
    .route('/:id')
    .get(ShiftController.getShiftById)
    .patch([permissionToChangeShifts, ShiftController.updateShiftById])
    .delete([permissionToChangeShifts, ShiftController.deleteShiftById])


export default router;