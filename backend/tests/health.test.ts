import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("Health API", () => {
  it("should return API health status", async () => {
    const response = await request(app)
      .get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });
});