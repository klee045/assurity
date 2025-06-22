import mongoose from "mongoose";
import { app } from "./app";
import { mongoDb } from "./db/mongo";
import { getAzureAccessToken } from "./middleware/token";

const port = process.env.PORT;

app.listen(port, () => {
  getAzureAccessToken(); // initialize Azure Access Token for Microsoft Graph API usage on app start

  mongoDb
    .then((db: mongoose.Mongoose) => {
      console.log(`MongoDB connected. Version: ${db.version}`);
    })
    .catch((err: any) => {
      console.log("Error connecting to MongoDB:", err);
    });

  console.log(`Example app listening on port ${port}`);
});
