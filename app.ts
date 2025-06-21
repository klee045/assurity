import "dotenv/config";
import express, { Request, Response } from "express";
import { checkAzureAccessToken } from "./middleware/token";

export const app = express();

app.use(checkAzureAccessToken);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
