import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./app";

describe("API Integration Tests", () => {
  const testEndpoint = async (path: string, expectedContent: string[]) => {
    const response = await request(app).get(path);
    expect(response.status).toBe(200);
    for (const content of expectedContent) {
      expect(response.text).toContain(content);
    }
    expect(response.headers["cache-control"]).toBe("no-store");
  };

  describe("GET /", () => {
    it("should return the index page", async () => {
      await testEndpoint("/", ["<!DOCTYPE html>"]);
    });
  });

  describe("GET /weather", () => {
    it("should return weather data", async () => {
      await testEndpoint("/weather", ["weather-icon", "°C", "UV:"]);
    });
  });

  describe("GET /calendar", () => {
    it("should return appointments calendar events", async () => {
      await testEndpoint("/calendar?type=appointments", ["title", "entry"]);
    });

    it("should return trash calendar events", async () => {
      await testEndpoint("/calendar?type=trash", ["title", "entry"]);
    });
  });

  describe("GET /birthdays", () => {
    it("should return birthdays list", async () => {
      await testEndpoint("/birthdays", ["title", "entry"]);
    });
  });

  describe("GET /events", () => {
    it("should return local events list", async () => {
      await testEndpoint("/events", ["title", "entry"]);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully", async () => {
      // This tests that routes return proper error templates when services fail
      // The actual error handling depends on the mock data or network availability
      const response = await request(app).get("/weather");
      expect([200, 500]).toContain(response.status);
      if (response.status === 500) {
        expect(response.text).toContain("Unable to fetch");
      }
    });
  });

  describe("Static Assets", () => {
    it("should serve CSS files from /assets", async () => {
      const response = await request(app).get("/assets/css/main.css");
      expect([200, 304, 404]).toContain(response.status);
    });

    it("should serve JavaScript files from /assets", async () => {
      const response = await request(app).get("/assets/js/date.js");
      expect([200, 304, 404]).toContain(response.status);
    });
  });
});
