import express from "express";
import { syncSecurityGroups } from "../controllers/group.controller";

const groupRouter = express.Router();

groupRouter.post("/security/sync", syncSecurityGroups);

export default groupRouter;
