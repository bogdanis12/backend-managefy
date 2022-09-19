import { Request } from "express"
import { Permissions } from "../models/user.model"

export interface IUser {
    _id: string,
    permission: Permissions
}

export interface IExtendedRequest extends Request {
    context?: {
        user: IUser
    }
}
