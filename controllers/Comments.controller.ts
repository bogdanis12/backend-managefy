import { Response } from "express";
import { ObjectId } from "mongodb";
import { ERRORS } from "../const/errors";
import LOCALES from "../const/locales";

import { Comments } from "../models/comments.model";
import { Permission } from "../models/permission.model";
import { Permissions } from "../models/user.model";


import { IExtendedRequest } from '../types';
import { DefaultError } from "../utils/DefaultError";

class CommentsController {

  static async createComment(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;

    try {
      const newComment = new Comments({ ...req.body, createdBy: userId });
      await newComment.save();
      res
        .status(201)
        .send(newComment);
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(400)
          .send(error.message);
      }
      else {
        res
          .status(400)
          .send(error);
      }
    }
  }

  static async getAllComments(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;
    const permission = req.context?.user.permission;

    try {
      if (permission === Permissions.Admin) {
        const comments = await Comments.find();
        res
          .status(200)
          .send(comments);
      } else {
        const comment = await Comments.find({ createdBy: new ObjectId(userId) }).select('-active');
        if (comment) {
          res
            .status(200)
            .send(comment);
        }
        else {
          res
            .status(404)
            .send(DefaultError.generate(404, ERRORS.COMMENT.noComments));
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(400)
          .send(error.message);
      } else {
        res
          .status(400)
          .send(error);
      }

    }
  }

  static async getCommentById(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;
    const permission = req.context?.user.permission;

    try {
      const { id } = req.params;
      const comment = await Comments.findById(id).select('-active');;
      if (comment) {
        if (permission === Permissions.Admin || userId === comment.createdBy?.toString()) {
          res
            .status(200)
            .send(comment);
        }
        else {
          res
            .status(401)
            .send(DefaultError.generate(401, LOCALES.en.unauthorized));
        }
      } else {
        res
          .status(404)
          .send(DefaultError.generate(404, ERRORS.COMMENT.notFound));
      }

    } catch (error) {
      if (error instanceof Error) {
        res
          .status(400)
          .send(error.message);
      } else {
        res
          .status(400)
          .send(error);
      }
    }
  }

  static async updateCommentById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedComment = await Comments.findByIdAndUpdate(id, { ...req.body, updatedAt: new Date(Date.now()) }, {
        new: true,
      }).select('-active');
      res
        .status(200)
        .send(updatedComment);
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(400)
          .send(error.message);
      } else {
        res
          .status(400)
          .send(error);
      }
    }
  }


  static async deleteCommentById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deletedComment = await Comments.findById(id).select('-active');
      await deletedComment?.update({ active: false });
      res
        .status(200)
        .send(deletedComment);
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(500)
          .send(DefaultError.generate(500, error.message));
      }
      else {
        return res
          .status(400)
          .send(error)
      }
    }
  }
}

export default CommentsController;
