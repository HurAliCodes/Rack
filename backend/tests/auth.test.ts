import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

const email = `test-${Date.now()}@example.com`;
const password = "Password123";

describe("Authentication", () => {
  let accessToken: string;
  let refreshToken: string;

  it("should register a user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password,
        name: "Test User",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it("should login", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it("should access protected /me route", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(email);
  });

  it("should reject unauthenticated /me request", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me");

    expect(response.status).toBe(401);
  });

  it("should reject invalid credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);
  });

  it("should refresh tokens", async () => {
    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();

    refreshToken = response.body.data.refreshToken;
  });

  it("should logout", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});