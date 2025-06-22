import { Client } from "@microsoft/microsoft-graph-client";
import "dotenv/config";
import express, { Request, Response } from "express";
import { errorHandler, logErrors } from "./error/error";
import { checkAzureAccessToken } from "./middleware/token";
import groupRouter from "./routes/group";

export const app = express();
export const msGraphClient = Client.init({
  authProvider: (done) => {
    done(null, process.env.AZURE_ACCESS_TOKEN || "");
  },
});

/**
 * Useful Middleware
 */
app.use(express.json());
app.use(checkAzureAccessToken);

/**
 * Routes
 */
app.use("/group", groupRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

/**
 * Errors
 */
app.use(logErrors);
app.use(errorHandler);
