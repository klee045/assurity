import msal from "@azure/msal-node";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { pinoLogger } from "../app";
import { MsalCcaTokenRequest, MsalConfig } from "../models/token.model";

/**
 * Configuration object to be passed to MSAL instance on creation.
 */
const msalConfig: MsalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID || "",
    authority:
      process.env.AAD_ENDPOINT ||
      "https://login.microsoftonline.com" + "/" + process.env.TENANT_ID,
    clientSecret: process.env.CLIENT_SECRET || "",
  },
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'.
 */
const tokenRequest: MsalCcaTokenRequest = {
  scopes: [
    process.env.GRAPH_ENDPOINT || "https://graph.microsoft.com" + "/.default",
  ],
};

/**
 * Initialize a confidential client application.
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Step 3 in https://learn.microsoft.com/en-us/graph/auth-v2-service
 * Obtain Microsoft access token to make API calls to Microsoft Graph API
 * using authentication logic in https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-v2-nodejs-console
 *
 * Ensure that first 2 steps have been completed
 * 1. Permissions have been configured
 * 2. Administrator Consent has been given.
 *
 * @returns accessToken - Access Token from Microsoft to call Microsoft Graph API
 */
export const getAzureAccessToken: () => Promise<{
  accessToken: string;
  expiresAt: Date;
}> = async () => {
  try {
    // get auth response using a confidential client application and obtain access token
    const authResponse: msal.AuthenticationResult | null =
      await cca.acquireTokenByClientCredential(tokenRequest);

    if (!authResponse) {
      throw new Error("Authentication failed");
    }
    pinoLogger.logger.debug("authResponse from msal", authResponse);

    // if expiresOn is null, set it to now
    const expiresAt: Date = authResponse.expiresOn
      ? new Date(authResponse.expiresOn)
      : new Date();

    process.env.AZURE_ACCESS_TOKEN = authResponse.accessToken;
    process.env.AZURE_ACCESS_TOKEN_EXPIRES_AT = expiresAt.toString();

    return {
      accessToken: authResponse.accessToken,
      expiresAt: expiresAt,
    };
  } catch (err: any) {
    pinoLogger.logger.info({ err }, "Error retrieving access token");
    throw new Error("Error retrieving access token");
  }
};

/**
 * Middleware to check expiry of access token
 * @param req ExpressJS Request object
 * @param res ExpressJS Response object
 * @param next ExpressJS NextFunction object
 * @returns
 */
export const checkAzureAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentTime: number = Date.now();
    const expiresAt: number = parseInt(
      process.env.AZURE_ACCESS_TOKEN_EXPIRES_AT || "0",
      10
    );

    // get new token if current is expired
    if (currentTime >= expiresAt || !process.env.AZURE_ACCESS_TOKEN) {
      const tokenResponse: {
        accessToken: string;
        expiresAt: Date;
      } = await getAzureAccessToken();

      // update env variables storing access token and expiry
      if (tokenResponse) {
        process.env.AZURE_ACCESS_TOKEN = tokenResponse.accessToken;
        process.env.AZURE_ACCESS_TOKEN_EXPIRES_AT =
          tokenResponse.expiresAt.toString();
      } else {
        res.status(500).json({ message: "Error obtaining new access token." });
        return;
      }
    }

    next();
  } catch (err: any) {
    pinoLogger.logger.debug(
      { err },
      "Error checking and/or obtaining new access token"
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
