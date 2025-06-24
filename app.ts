import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import "dotenv/config";
import express, { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import pino from "pino";
import logger from "pino-http";
import { errorHandler } from "./error/error";
import { checkAzureAccessToken } from "./middleware/token";
import groupRouter from "./routes/group";

// @azure/identity
const credential = new ClientSecretCredential(
  process.env.TENANT_ID || "YOUR_TENANT_ID",
  process.env.CLIENT_ID || "YOUR_CLIENT_ID",
  process.env.CLIENT_SECRET || "YOUR_CLIENT_SECRET"
);

// @microsoft/microsoft-graph-client/authProviders/azureTokenCredentials
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  // The client credentials flow requires that you request the
  // /.default scope, and pre-configure your permissions on the
  // app registration in Azure. An administrator must grant consent
  // to those permissions beforehand.
  scopes: ["https://graph.microsoft.com/.default"],
});

export const app = express();
export const msGraphClient = Client.initWithMiddleware({
  authProvider: authProvider,
});
export const pinoLogger = logger({
  // Reuse an existing logger instance
  logger: pino({ level: process.env.LOG_LEVEL || "info" }),

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
});

/**
 * Useful Middleware
 */
app.use(express.json());
app.use(pinoLogger);
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
