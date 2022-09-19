import mongoose, { CallbackWithoutResultAndOptionalError, Document, Model, Schema } from "mongoose";
import bcrypt from 'bcryptjs';
import { NextFunction } from "express";
import crypto from 'crypto'
import { Permission } from "./permission.model";


export enum Permissions {
    Admin = "6324a93801735c428844d3cc",
    User = "6324a93801735c428844d3ce"
}

interface IAuthMethods {
    authenticate: (plainPassword: string) => Promise<boolean>,
    generateResetPasswordToken: () => void
}

const authSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/g, 'Email invalid']
    },
    password: {
        type: String,
        required: true,
        match: [/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&.])[A-Za-zd$@$!%*?&].{8,}/, "Password does not match security criteria"]
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 99
    },
    firstName: {
        type: String,
        required: true,
        min: 2
    },
    lastName: {
        type: String,
        required: true,
        min: 2
    },
    permission: {
        type: Schema.Types.ObjectId,
        default: Permissions.User,
        ref: Permission
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpiryDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now())
    },
    updatedAt: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    }
});

//@ts-ignore
authSchema.pre('save', async function (next: NextFunction) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(12);
        const encryptedPassword = await bcrypt.hash(this.password, salt);
        this.password = encryptedPassword;
        return next();
    }

    next();
});



authSchema.methods.authenticate = async function (plainPassword: string) {
    return bcrypt.compare(plainPassword, this.password);
};

authSchema.methods.generateResetPasswordToken = function () {
    this.resetPasswordToken = crypto.randomBytes(16).toString('hex');
    this.resetPasswordTokenExpiryDate = Date.now() + 60 * 60 * 1000;
    this.save();
};

authSchema.pre(/find/, function (next: CallbackWithoutResultAndOptionalError) {
    //@ts-ignore
    this.find({ active: true });
    next();
});


export type userType = mongoose.InferSchemaType<typeof authSchema> & Document & IAuthMethods;
export const User = mongoose.model<userType>('Auth', authSchema);