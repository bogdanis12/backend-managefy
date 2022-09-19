import { Response } from "express";
import { ObjectId } from "mongodb";

import { Shift } from "../models/shift.model";
import { Permissions } from "../models/user.model";

import { IExtendedRequest } from '../types';
import LOCALES from "../const/locales";
import { DefaultError } from "../utils/DefaultError";
import { ERRORS } from "../const/errors";

class ShiftController {

  static async createShift(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;

    try {
      const newShift = new Shift({ ...req.body, user: userId });
      await newShift.save();
      res
        .status(201)
        .send(newShift);
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(500)
          .send(DefaultError.generate(500, error.message));
      }
      else {
        return res
          .status(500)
          .send(error)
      }
    }
  }

  static async getAllShifts(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;
    const permission = req.context?.user.permission;

    try {
      if (permission === Permissions.Admin) {
        const shifts = await Shift.find();
        res
          .status(200)
          .send(shifts);
      } else {
        const shift = await Shift.find({ user: new ObjectId(userId) }).select('-active');
        if (shift) {
          res
            .status(200)
            .send(shift);
        }
        else {
          res
            .status(404)
            .send(DefaultError.generate(404, ERRORS.SHIFT.noShifts));
        }
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

  static async getShiftById(req: IExtendedRequest, res: Response) {
    const userId = req.context?.user._id;
    const permission = req.context?.user.permission;

    try {
      const { id } = req.params;
      const shift = await Shift.findById(id).select('-active');

      if (shift) {
        if (permission === Permissions.Admin || userId === shift.user?.toString()) {
          res
            .status(200)
            .send(shift);
        }
        else {
          res
            .status(403)
            .send(DefaultError.generate(403, LOCALES.en.unauthorized));
        }
      } else {
        res
          .status(404)
          .send(DefaultError.generate(404, ERRORS.SHIFT.notFound));
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

  static async updateShiftById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedShift = await Shift.findByIdAndUpdate(
        id,
        { ...req.body, $addToSet: { "comment": req.body.commentId } },
        { new: true }).select('-active');
      res
        .status(200)
        .send(updatedShift);
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


  static async deleteShiftById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedShift = await Shift.findById(id).select('-active');
      await updatedShift?.update({ active: false });
      res
        .status(200)
        .send(updatedShift);
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

export default ShiftController;
