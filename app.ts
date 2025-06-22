import { Client } from "@microsoft/microsoft-graph-client";
import "dotenv/config";
import express, { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import pino from "pino";
import logger from "pino-http";
import { errorHandler } from "./error/error";
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
app.use(
  logger({
    // Reuse an existing logger instance
    logger: pino(),

    // Define a custom request id function
    genReqId: function (req, res) {
      const existingID = req.id ?? req.headers["x-request-id"];
      if (existingID) return existingID;
      const id = randomUUID();
      res.setHeader("X-Request-Id", id);
      return id;
    },

    // Define custom serializers
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },

    // Set to `false` to prevent standard serializers from being wrapped.
    wrapSerializers: true,

    // Logger level is `info` by default
    // useLevel: "info",

    // Define a custom logger level
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return "silent";
      }
      return "info";
    },

    // Define a custom success message
    customSuccessMessage: function (req, res) {
      if (res.statusCode === 404) {
        return "resource not found";
      }
      return `${req.method} completed`;
    },

    // Define a custom receive message
    customReceivedMessage: function (req, res) {
      return "request received: " + req.method;
    },

    // Define a custom error message
    customErrorMessage: function (req, res, err) {
      return "request errored with status code: " + res.statusCode;
    },

    // Override attribute keys for the log object
    customAttributeKeys: {
      req: "request",
      res: "response",
      err: "error",
      responseTime: "timeTaken",
    },
  })
);
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
app.use(errorHandler);
