import { NextFunction, Response } from "express";
import config, { IConfig } from 'config';
import jwt, { Payload } from 'jwt-promisify';
import { assocPath } from 'ramda';

import { Config, IExtendedRequest, IUser } from "../types";
import { DefaultError } from "../utils/DefaultError";

const { JWT_SECRET } = config as Config & IConfig;

export const tokenGuard = async (req: IExtendedRequest, res: Response, next: NextFunction) => {

  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (req.headers.authorization) {
    token = req.headers.authorization?.replace('Bearer ', '');
  }

  try {
    const decodedToken = await jwt.verify(token, JWT_SECRET) as Payload & IUser
    req.context = assocPath(["user"], {
      _id: decodedToken._id,
      permission: decodedToken.permission
    }, req.context);

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