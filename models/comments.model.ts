import { NextFunction } from "express";
import { MongoError } from "mongodb";
import mongoose, { HydratedDocument, Model, Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";
import { User } from "./user.model";
import { DefaultError } from '../utils/DefaultError';

const commentsSchema = new Schema({
    comment: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: User
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
commentsSchema.post('save', function (error: MongoError, doc: Document, next: NextFunction) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        //@ts-ignore
        return next(DefaultError.generate(400, `There was a duplicate key ${JSON.stringify(error.keyValue)}`));
    }
    //@ts-ignore
    next();
});

commentsSchema.pre(/find/, function (next: CallbackWithoutResultAndOptionalError) {
    //@ts-ignore
    this.find({ active: true });
    next();
});


export type commentsType = mongoose.InferSchemaType<typeof commentsSchema>;
export const Comments = mongoose.model<commentsType>('Comments', commentsSchema);

