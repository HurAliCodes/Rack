import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../../src/app";

describe("Wardrobe API", () => {
  let accessToken: string;
  let clothingItemId: string;

  it("should register a test user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: `wardrobe-${Date.now()}@test.com`,
        password: "Password123!",
      });

    expect(response.status).toBe(201);
  });

  it("should reject unauthenticated wardrobe requests", async () => {
    const response = await request(app)
      .get("/api/v1/wardrobe/items");

    expect(response.status).toBe(401);
  });
});