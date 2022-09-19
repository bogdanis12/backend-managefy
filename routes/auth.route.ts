import { Router } from "express";

import AuthController from '../controllers/Auth.controller';

const router = Router();

router
    .route('/register')
    .post(AuthController.register)

router
    .route('/login')
    .post(AuthController.login)

router
    .route('/logout')
    .post(AuthController.logout)

router
    .route('/resetPassword')
    .post(AuthController.triggerResetPassword)

router
    .route('/resetPassword/:resetToken')
    .post(AuthController.resetPassword)


export default router;