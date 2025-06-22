import axios, { AxiosResponse } from "axios";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { AzureOAuthResponse } from "../models/token.model";

/**
 * Step 3 in https://learn.microsoft.com/en-us/graph/auth-v2-service
 * Obtain Microsoft access token to make API calls to Microsoft Graph API
 *
 * Ensure that first 2 steps have been completed
 * 1. Permissions have been configured
 * 2. Administrator Consent has been given.
 *
 * @returns {Promise<string | undefined>} accessToken - Access Token from Microsoft to call Microsoft Graph API
 */
export const getAzureAccessToken: () => Promise<
  | {
      accessToken: string;
      expiresAt: number;
    }
  | undefined
> = async () => {
  try {
    const tenantId: string = process.env.TENANT_ID || "";
    const clientId: string = process.env.CLIENT_ID || "";
    const clientSecret: string = process.env.CLIENT_SECRET || "";
    const oauthUrl: string = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params: URLSearchParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
    });

    // Obtain access token
    const response: AxiosResponse<AzureOAuthResponse> = await axios.post(
      oauthUrl,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken: string = response.data.access_token;
    console.log("access token obtained", accessToken);

    // Temporarily store in env, ideally to be stored in an equivalent of AWS Secrets Manager
    process.env.AZURE_ACCESS_TOKEN = accessToken;
    console.log("env token", process.env.AZURE_ACCESS_TOKEN);

    const expiresIn: number = response.data.expires_in;
    const expiresAt: number = Date.now() + expiresIn * 1000;
    process.env.AZURE_ACCESS_TOKEN_EXPIRES_AT = expiresAt.toString();

    return { accessToken: accessToken, expiresAt: expiresAt };
  } catch (error: any) {
    console.error(
      "Error retrieving access token:",
      error.response ? error.response.data : error.message
    );
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
    const currentTime = Date.now();
    const expiresAt = parseInt(
      process.env.AZURE_ACCESS_TOKEN_EXPIRES_AT || "0",
      10
    );

    // get new token if current is expired
    if (currentTime >= expiresAt || !process.env.AZURE_ACCESS_TOKEN) {
      console.log("Token expired or does not exist. Requesting new token...");
      const tokenResponse = await getAzureAccessToken();

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
  } catch (error) {
    console.error("Error obtaining new access token", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
