import "dotenv/config";
import express, { Request, Response } from "express";
import { checkAzureAccessToken } from "./middleware/token";
import { Client } from "@microsoft/microsoft-graph-client";

export const app = express();
export const msGraphClient = Client.init({
  authProvider: (done) => {
    done(null, process.env.AZURE_ACCESS_TOKEN || "");
  },
});

app.use(checkAzureAccessToken);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
