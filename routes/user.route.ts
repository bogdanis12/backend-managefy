import { Router } from "express";

import UserController from '../controllers/User.controller';
import { permissionToUpdateUser } from "../middlewares/permissionToUpdateUsers.middleware";

const router = Router();

router
  .route('/')
  .get(UserController.getAllUsers)

router
  .route("/:id")
  .get(UserController.getUserById)
  .patch([permissionToUpdateUser, UserController.updateUserById])
  .delete([permissionToUpdateUser, UserController.deleteUser])


export default router;