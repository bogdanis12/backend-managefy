import { Router } from "express";

import PermissionsController from "../controllers/Permissions.controller";



const router = Router();

router
    .route('/')
    .get(PermissionsController.getAllPermissions)


export default router;