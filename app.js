import express from "express";
import "dotenv/config";

export const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
