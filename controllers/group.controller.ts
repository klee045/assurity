import { NextFunction, Request, Response } from "express";
import * as GroupService from "../services/group.service";

export const syncSecurityGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const syncSecurityGroups = await GroupService.syncSecurityGroups();

    res.status(200).json({ message: "Security groups synced successfully." });
  } catch (err: any) {
    next(err);
  }
};
