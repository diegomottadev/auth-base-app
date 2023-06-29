import request from "supertest";
import { app, server } from "../index"; // Import your Express app and server
import { disconnectDB } from "../connection/connection";
import * as roleController from '../api/resources/roles/roles.controller';
import { Role } from "../models/role.model";
import { InfoRoleInUse } from "../api/resources/roles/roles.error";

// ...
describe("Roles", () => {
    afterAll(async () => {
        server.close(); // Close the server to stop accepting new connections
      
        await disconnectDB(); // Disconnect from the database
      
        // Clean up any remaining resources or perform final operations
      });
    describe('POST /roles', () => {
        afterEach(() => {
          jest.clearAllMocks(); // Reset mock after each test
        });
      
        let token: string;
      
        beforeAll(async () => {
          // Login and get the JWT token
          const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@admin.com', password: 'admin' });
      
          // Extract the JWT token from the login response
          token = loginResponse.body.token;
        });
      
        it('should create a new role', async () => {
          // Mock the roleController.create method
          const mockCreate = jest.spyOn(roleController, 'create').mockResolvedValueOnce({
            name: 'TestRole',
            // Other properties of the role
          } as Role);
      
          const roleData = {
            name: 'TestRole',
            // Other properties of the role
          };
      
          // Send a request to create a new role
          const response = await request(app)
            .post('/roles')
            .set('Authorization', `Bearer ${token}`)
            .send(roleData);
      
          expect(response.status).toBe(201); // Expect the response status code to be 201 (Created)
          expect(response.body).toEqual({
            message: `Role with name [${roleData.name}] created successfully.`,
            data: roleData.name,
          }); // Expect the response body to contain the success message and data of the created role
      
          expect(mockCreate).toHaveBeenCalledTimes(1); // Expect the roleController.create method to be called once
          expect(mockCreate).toHaveBeenCalledWith(roleData); // Expect the roleController.create method to be called with the correct role data
        });
      
        it('should return an error if the role already exists', async () => {
          // Mock the roleController.create method to reject with a specific error
          const mockCreate = jest.spyOn(roleController, 'create').mockRejectedValueOnce(new InfoRoleInUse());
      
          const existingRoleData = {
            name: 'ExistingRole',
            // Other properties of the existing role
          };
      
          // Send a request to create a role that already exists
          const response = await request(app)
            .post('/roles')
            .set('Authorization', `Bearer ${token}`)
            .send(existingRoleData);
      
          expect(response.status).toBe(409); // Expect the response status code to be 409 (Conflict)
          expect(response.body).toEqual({
            message: 'There is a role with the same name.',
          }); // Expect the response body to contain the error message indicating a role with the same name exists
      
          expect(mockCreate).toHaveBeenCalledTimes(1); // Expect the roleController.create method to be called once
          expect(mockCreate).toHaveBeenCalledWith(existingRoleData); // Expect the roleController.create method to be called with the correct role data
        });
      
        it('should return an error if an unexpected error occurs', async () => {
          // Mock an error in the roleController.create method
          jest.spyOn(roleController, 'create').mockRejectedValueOnce(new Error('Unexpected error'));
      
          // Define the role data
          const roleData = {
            name: 'TestRole',
            // Other properties of the role
          };
      
          // Send a request to create a new role
          const response = await request(app)
            .post('/roles')
            .set('Authorization', `Bearer ${token}`)
            .send(roleData);
      
          expect(response.status).toBe(500); // Expect the response status code to be 500 (Internal Server Error)
      
          // Expect the response body to contain an error message indicating an unexpected error occurred
          expect(response.body).toEqual({
            message: 'Error creating the role.',
          });
        });
      });
      
      describe('GET /roles', () => {
        afterEach(() => {
          jest.clearAllMocks(); // Reset mock after each test
        });
      
        let token: string;
      
        beforeAll(async () => {
          // Login and get the JWT token
          const loginResponse = await request(app) // Send a POST request to '/auth/login' endpoint
            .post('/auth/login')
            .send({ email: 'admin@admin.com', password: 'admin' });
      
          // Extract the JWT token from the login response
          token = loginResponse.body.token;
        });
      
        it('should return a role when a valid ID is provided', async () => {
          // Mock the roleController.find method to return a role
          const mockRole = { id: 1, name: 'TestRole' } as Role;
          jest.spyOn(roleController, 'find').mockResolvedValueOnce(mockRole);
      
          const response = await request(app) // Send a GET request to '/roles/1' endpoint
            .get('/roles/1')
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(200); // Expect the response status code to be 200 (OK)
          expect(response.body).toEqual(mockRole); // Expect the response body to be equal to the mockRole
        });
      
        it('should return a 405 status and error message when the role does not exist', async () => {
          // Mock the roleController.find method to return null (role not found)
          jest.spyOn(roleController, 'find').mockResolvedValueOnce(null);
          const response = await request(app) // Send a GET request to '/roles/1' endpoint
            .get('/roles/1')
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(405); // Expect the response status code to be 405 (Method Not Allowed)
          expect(response.body).toEqual({ message: `Role with ID [1] does not exist.` }); // Expect the response body to contain an error message
        });
      
        it('should return a 500 status and error message when an unexpected error occurs', async () => {
          // Mock the roleController.find method to throw an error
          const errorMessage = 'Unexpected error';
          jest.spyOn(roleController, 'find').mockRejectedValueOnce(new Error(errorMessage));
      
          const response = await request(app) // Send a GET request to '/roles/1' endpoint
            .get('/roles/1')
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(500); // Expect the response status code to be 500 (Internal Server Error)
          expect(response.body).toEqual({ message: 'Error getting the role.' }); // Expect the response body to contain an error message
        });
      });
      
});
