import request from "supertest";
import { app } from "./app";

describe("Test App", () => {
  it("should return Hello World", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
