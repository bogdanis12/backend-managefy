import mongoose, { Document, Schema } from "mongoose";


const permissionSchema = new Schema({
    permission: {
        type: String,
    }
});

export type permissionType = mongoose.InferSchemaType<typeof permissionSchema> & Document;
export const Permission = mongoose.model<permissionType>('Permission', permissionSchema);