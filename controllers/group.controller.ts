import { NextFunction, Request, Response } from "express";
import * as GroupService from "../services/group.service";
import { ERROR_MESSAGE } from "../constants/error";

export const syncSecurityGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const syncSecurityGroups = await GroupService.syncSecurityGroups();

    res.status(200).json({ message: "Security groups synced successfully." });
  } catch (err: any) {
    // TODO: explore creating custom error that takes in http status code so there is no need for rudimentary === checks
    if (err.message === ERROR_MESSAGE.UNAUTHORIZED) {
      res.status(401).json({ message: ERROR_MESSAGE.UNAUTHORIZED });
      return;
    } else if (err.message === ERROR_MESSAGE.FORBIDDEN) {
      res.status(403).json({ message: ERROR_MESSAGE.FORBIDDEN });
      return;
    }
    return next(err);
  }
};
