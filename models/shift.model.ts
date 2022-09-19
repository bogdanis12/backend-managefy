import { NextFunction } from "express";
import { MongoError } from "mongodb";
import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";
import { User } from "./user.model";
import { DefaultError } from '../utils/DefaultError';


const shiftSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    workPlace: {
        type: String,
        enum: ['home', 'office'],
        required: true
    },
    profitPerHour: {
        type: Number,
        required: true
    },
    comment: {
        type: [String],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    active: {
        type: Boolean,
        default: true
    }

});


//@ts-ignore
shiftSchema.post('save', function (error: MongoError, doc: Document, next: NextFunction) {
    console.log(error.name, error.code);
    if (error.name === "MongoServerError" && error.code === 11000) {
        //@ts-ignore
        return next(DefaultError.generate(400, `There was a duplicate key ${JSON.stringify(error.keyValue)}`));
    }
    //@ts-ignore
    next();
});

shiftSchema.pre(/find/, function (next: CallbackWithoutResultAndOptionalError) {
    //@ts-ignore
    this.find({ active: true });
    next();
});


export type shiftType = mongoose.InferSchemaType<typeof shiftSchema>;
export const Shift = mongoose.model<shiftType>('Shift', shiftSchema);

