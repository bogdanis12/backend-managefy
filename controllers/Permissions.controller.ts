import { Response } from "express";

import { Permission } from "../models/permission.model";
import { Permissions } from "../models/user.model";
import LOCALES from "../const/locales";


import { IExtendedRequest } from '../types';
import { DefaultError } from "../utils/DefaultError";

class PermissionsController {

  static async getAllPermissions(req: IExtendedRequest, res: Response) {
    const permission = req.context?.user.permission;

    try {
      if (permission === Permissions.Admin) {
        const permissions = await Permission.find();
        res
          .status(200)
          .send(permissions);
      } else {
        res
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
  }
}

export default PermissionsController;
