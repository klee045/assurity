import mongoose from "mongoose";

const mongoDbCnString: string = process.env.MONGODB_CONNECTION_STRING || "";

export const mongoDb: Promise<mongoose.Mongoose> =
  mongoose.connect(mongoDbCnString);
