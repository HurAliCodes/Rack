import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

const email = `profile-${Date.now()}@example.com`;
const password = "Password123";

describe("Profile", () => {
  let accessToken: string;

  it("should register a user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password,
        name: "Profile User",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    accessToken = response.body.data.accessToken;
  },10000);

  it("should get the profile", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it("should update the profile", async () => {
    const response = await request(app)
      .patch("/api/v1/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated User",
        preferredStyles: ["casual", "minimalist"],
        favoriteColors: ["black", "white"],
        topSize: "M",
        bottomSize: "32",
        shoeSize: "42",
        theme: "dark",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.name).toBe("Updated User");
    expect(response.body.data.theme).toBe("dark");
  });

  it("should reject unauthenticated profile requests", async () => {
    const response = await request(app)
      .get("/api/v1/profile");

    expect(response.status).toBe(401);
  });
});