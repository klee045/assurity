import { NextFunction, Request, Response } from "express";
import { getAzureAccessToken } from "../controllers/auth";

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
