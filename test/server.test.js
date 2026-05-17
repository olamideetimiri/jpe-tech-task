const request = require("supertest");
const app = require("../src/server");

describe("Release Status Dashboard", () => {
  test("GET /health returns ok", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.app).toBe("Release Status Dashboard");
    expect(typeof response.body.environment).toBe("string");
    expect(typeof response.body.uptime).toBe("number");
  });

  test("GET / renders the release dashboard", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Release Status Dashboard");
    expect(response.text).toContain("<table");
    expect(response.text).toContain("<th>Service</th>");
    expect(response.text).toContain("<th>Version</th>");
    expect(response.text).toContain("<th>Environment</th>");
    expect(response.text).toContain("<th>Status</th>");
    expect(response.text).toContain("<th>Deployed At</th>");
  });

  test("GET /api/releases returns release data with the expected shape", async () => {
    const response = await request(app).get("/api/releases");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    expect(response.body[0]).toEqual(
      expect.objectContaining({
        service: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
        status: expect.any(String),
        deployedAt: expect.any(String)
      })
    );
  });

  test("GET /api/config returns safe config defaults", async () => {
    const response = await request(app).get("/api/config");

    expect(response.statusCode).toBe(200);
    expect(response.body.appName).toBe("Release Status Dashboard");
    expect(response.body.environment).toBe("test");
    expect(response.body.port).toBe(3000);
    expect(response.body.debug).toBe(false);
  });
});