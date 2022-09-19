import { Response } from 'express'
import { ERRORS } from '../const/errors';
import LOCALES from '../const/locales';

import { Permissions, User } from "../models/user.model";
import { IExtendedRequest } from "../types";
import { DefaultError } from '../utils/DefaultError';


export default class UserController {
  static async getAllUsers(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;
    const permission = req.context?.user.permission

    try {
      if (permission === Permissions.User) {
        const user = await User.findById(userId).select('-active');
        res
          .status(200)
          .send(user);
      } else {
        const users = await User.find();
        res
          .status(200)
          .send(users);
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

  static async getUserById(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;
    const permission = req.context?.user.permission;

    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res
          .status(404)
          .send(DefaultError.generate(404, ERRORS.USER.notFound));
      }
      if (userId === id || permission === Permissions.Admin) {
        const user = await User.findById(id).select('-active');
        res
          .status(200)
          .send(user);
      }
      else {
        res
          .status(403)
          .send(DefaultError.generate(403, LOCALES.en.unauthorized));
      };
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

  static async updateUserById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userToUpdate = await User.findById(id);
      if (userToUpdate) {
        const password = req.body.password;
        delete req.body.password;
        const updatedUser = await userToUpdate?.update({ ...req.body, updatedAt: new Date(Date.now()) }, { new: true, runValidators: true });
        userToUpdate!.password = password;
        await userToUpdate!.save();
        res
          .status(200)
          .send(updatedUser);
      }
      else {
        res
          .status(404)
          .send(DefaultError.generate(404, ERRORS.USER.notFound))
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

  static async deleteUser(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findById(id).select('-active');
      await deletedUser?.update({ active: false });
      res
        .status(200)
        .send(deletedUser);
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(400)
          .send(error.message);
      }
      else {
        res
          .status(403)
          .send(error);
      }
    }
  }

}