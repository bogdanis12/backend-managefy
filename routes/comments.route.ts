import { Router } from "express";

import CommentsController from '../controllers/Comments.controller';
import { permissionToChangeComments } from "../middlewares/permissionToChangeComments.middleware";


const router = Router();

router
    .route('/')
    .get(CommentsController.getAllComments)
    .post(CommentsController.createComment)

router
    .route('/:id')
    .get(CommentsController.getCommentById)
    .patch([permissionToChangeComments, CommentsController.updateCommentById])
    .delete([permissionToChangeComments, CommentsController.deleteCommentById])


export default router;