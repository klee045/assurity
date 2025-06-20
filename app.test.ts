import request from "supertest";
import { app } from "./app";

describe("Test App", () => {
  it("should return Hello World", async () => {
    // TODO: fix typing
    const res: any = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
