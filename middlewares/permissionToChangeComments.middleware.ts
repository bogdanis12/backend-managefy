import { NextFunction, Response } from "express";

import { Permissions } from "../models/user.model";
import { Comments } from "../models/comments.model";
import { IExtendedRequest } from "../types";
import LOCALES from "../const/locales";
import { DefaultError } from "../utils/DefaultError";
import { ERRORS } from "../const/errors";

export const permissionToChangeComments = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const updatedComment = await Comments.findById(id);
    if (!updatedComment) {
      return res
        .status(404)
        .send(DefaultError.generate(404, ERRORS.COMMENT.notFound));
    }

    const isUserAuthorizedToChange =
      updatedComment?.createdBy?.toString() === req.context?.user._id || req.context?.user.permission === Permissions.Admin;

    if (!isUserAuthorizedToChange) {
      return res
        .status(403)
        .send(DefaultError.generate(403, LOCALES.en.unauthorized));
    }
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(500)
        .send(DefaultError.generate(500, error.message));
    }
    else {
      return res
        .status(500)
        .send(DefaultError.generate(500, error))
    }
  }

  next();

}