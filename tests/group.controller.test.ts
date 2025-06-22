import "dotenv/config";
import mongoose from "mongoose";
import request, { Response } from "supertest";
import { app } from "../app";
import * as GroupService from "../services/group.service";

jest.mock("../services/group.service");

describe("Security Group Controller Tests", () => {
  // init mongodb connection before each test
  beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING || "");
  });

  // end mongodb connection after each test
  afterEach(async () => {
    await mongoose.connection.close();
  });

  describe("POST /group/security/sync", () => {
    it("should return status 200 when successfully syncing security groups in MongoDB with Microsoft Azure", async () => {
      const res: Response = await request(app).post("/group/security/sync");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Security groups synced successfully.");
    });

    it("should return status 500 when failing to sync security groups in MongoDB with Microsoft Azure", async () => {
      // typecast to jest.Mock to allow mockRejectedValue to be called
      (GroupService.syncSecurityGroups as jest.Mock).mockRejectedValue(
        new Error("Sync failed")
      );
      const res: Response = await request(app).post("/group/security/sync");

      expect(res.status).toBe(500);
    });
  });
});
