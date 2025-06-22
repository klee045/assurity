import mongoose from "mongoose";
import { app, pinoLogger } from "./app";
import { mongoDb } from "./db/mongo";
import { getAzureAccessToken } from "./middleware/token";

const port = process.env.PORT;

app.listen(port, () => {
  getAzureAccessToken(); // initialize Azure Access Token for Microsoft Graph API usage on app start

  mongoDb
    .then((db: mongoose.Mongoose) => {
      pinoLogger.logger.info(`MongoDB connected. Version: ${db.version}`);
    })
    .catch((err: any) => {
      pinoLogger.logger.error(`Error connecting to MongoDB: ${err}`);
    });

  pinoLogger.logger.info(`App listening on port ${port}`);
});
