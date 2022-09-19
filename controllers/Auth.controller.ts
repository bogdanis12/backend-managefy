import { Request, Response } from "express";
import jwt from 'jwt-promisify';

import config, { IConfig } from 'config';
import { User } from "../models/user.model";
import { ERRORS } from '../const/errors';
import { Config } from "../types";
import MailerService from "../services/Mailer.service";
import { getLocalURL } from "../utils/url";
import LOCALES from "../const/locales";
import { DefaultError } from "../utils/DefaultError";
import { Successful } from "../utils/Successful";


const { JWT_SECRET, JWT_EXPIRY_TIME } = config as Config & IConfig;

export default class AuthController {

  static async register(req: Request, res: Response) {
    try {
      const newUser = new User({ ...req.body });
      const { _id, permission } = await newUser.save();
      const generatedJwt = await jwt.sign({ _id, permission }, JWT_SECRET, { expiresIn: JWT_EXPIRY_TIME });
      MailerService.registerMessage(`${req.body.email}`, req.body.email);

      res
        .status(201)
        .cookie("token", generatedJwt)
        .json({
          _id,
          token: generatedJwt
        })

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes(ERRORS.MONGO.CODE_ERROR)) {
          res
            .status(409)
            .send(DefaultError.generate(409, ERRORS.MONGO.DUPLICATE_USERNAME_EMAIL))
          return;
        }

        if (error.message.includes(ERRORS.MONGO.AUTH_FAILED)) {
          res
            .status(400)
            .send(DefaultError.generate(400, error.message));
          return;
        }

        res
          .status(500)
          .send(DefaultError.generate(500, error.message));
      }
    }
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const matchingUser = await User.findOne({ username });

      if (!matchingUser || !(await matchingUser.authenticate(password))) {
        res
          .status(400)
          .send(DefaultError.generate(400, ERRORS.MONGO.BAD_LOGIN));
        return;
      }

      const generatedJwt = await jwt.sign({
        _id: matchingUser._id,
        permission: matchingUser.permission
      }, JWT_SECRET, { expiresIn: JWT_EXPIRY_TIME });

      res
        .status(200)
        .cookie("token", generatedJwt)
        .send({
          _id: matchingUser._id,
          token: generatedJwt
        });
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .send(DefaultError.generate(500, error.message));
      }
      else {
        res
          .status(500)
          .send(DefaultError.generate(500, error));
      }
    }
  }

  static async triggerResetPassword(req: Request, res: Response) {
    const resetURL = `${getLocalURL(req)}${LOCALES.en.resetPassword.path}`;
    const { email: resetEmail } = req.body;
    try {

      const userToReset = await User.findOne({ email: resetEmail });
      const authUserToReset = await User.findById(userToReset?._id);
      if (authUserToReset) {
        authUserToReset.generateResetPasswordToken();
        await MailerService.forgotPasswordMessage(resetEmail, { resetText: `${authUserToReset.resetPasswordToken}`, resetURL: `${resetURL}${authUserToReset.resetPasswordToken}` });
      }

    } catch (error) {
      console.error(error);
    } finally {
      res
        .status(200)
        .send(Successful.generate(200, LOCALES.en.email.sent));
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const userToReset = await User.findOne({
      resetPasswordToken: req.params.resetToken,
      resetPasswordTokenExpiryDate: { "$gte": Date.now() }
    });

    if (!userToReset) {
      return res
        .status(400)
        .send(DefaultError.generate(400, ERRORS.EMAIL.invalidLink));
    }

    try {
      userToReset.password = req.body.newPassword;
      await userToReset.save();
      res
        .status(200)
        .send(Successful.generate(200, LOCALES.en.password.successfulyChanged))
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(400)
          .send(DefaultError.generate(400, error.message));
      } else {
        res
          .status(500)
          .send(DefaultError.generate(500, error));
      }
    }

  }

  static async logout(req: Request, res: Response) {
    try {
      res
        .status(200)
        .cookie('token', '')
        .send(Successful.generate(200, LOCALES.en.logout.success))
    } catch (error) {
      res
        .status(500)
        .send(DefaultError.generate(500, error));
    }

  }

}
