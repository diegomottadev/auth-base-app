import request from "supertest";
import { app, server } from "../index"; // Import your Express app and server
import { disconnectDB } from "../connection/connection";

describe("User profile", () => {
  afterAll(async () => {
    server.close();
    await disconnectDB();
  
  });

  it("should return the user root profile when called with valid authentication", async () => {
    // Log in to obtain a valid JWT token
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "admin@admin.com", password: "admin" });


    // Extract the JWT token from the login response
    const token = loginResponse.body.token;

    // Make the request to the /me endpoint with the JWT token in the header
    const response = await request(app)
      .get("/profile/me")
      .set("Authorization", `Bearer ${token}`);

    // Assert the response
    expect(response.status).toBe(200);

    // Check if the response body is a valid JSON
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "Admin");
    expect(response.body).toHaveProperty("email", "admin@admin.com");
    // expect(response.body).toHaveProperty("role", {
    //   id: 1,
    //   name: "ADMIN",
    //   createdAt: expect.any(String),
    //   updatedAt: expect.any(String),
    //   deletedAt: null,
    //   permissions: expect.any(Array),
    // });
    expect(response.body.role).toHaveProperty("name", "ADMIN");
    expect(response.body.role).toHaveProperty("permissions",  expect.any(Array));


  });


  it("should return the user normal profile when called with valid authentication", async () => {
    // Log in to obtain a valid JWT token
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "user@user.com", password: "user" });


    // Extract the JWT token from the login response
    const token = loginResponse.body.token;

    // Make the request to the /me endpoint with the JWT token in the header
    const response = await request(app)
      .get("/profile/me")
      .set("Authorization", `Bearer ${token}`);

    // Assert the response
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "user");
    expect(response.body).toHaveProperty("email", "user@user.com");
    // expect(response.body).toHaveProperty("role", {
    //   id: 1,
    //   name: "ADMIN",
    //   createdAt: expect.any(String),
    //   updatedAt: expect.any(String),
    //   deletedAt: null,
    //   permissions: expect.any(Array),
    // });
    expect(response.body.role).toHaveProperty("name", "User");
    expect(response.body.role).toHaveProperty("permissions",  expect.any(Array));


  });


  it("should return the guest user profile when called with valid authentication", async () => {
    // Log in to obtain a valid JWT token
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "guest@guest.com", password: "guest" });


    // Extract the JWT token from the login response
    const token = loginResponse.body.token;

    // Make the request to the /me endpoint with the JWT token in the header
    const response = await request(app)
      .get("/profile/me")
      .set("Authorization", `Bearer ${token}`);

    // Assert the response
    expect(response.status).toBe(200);

    // Check if the response body is a valid JSON
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "guest");
    expect(response.body).toHaveProperty("email", "guest@guest.com");
    // expect(response.body).toHaveProperty("role", {
    //   id: 1,
    //   name: "ADMIN",
    //   createdAt: expect.any(String),
    //   updatedAt: expect.any(String),
    //   deletedAt: null,
    //   permissions: expect.any(Array),
    // });
    expect(response.body.role).toHaveProperty("name", "Guest");
    expect(response.body.role).toHaveProperty("permissions",  expect.any(Array));


  });

  // Additional test cases...
});
