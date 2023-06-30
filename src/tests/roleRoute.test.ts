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
      
    describe("GET /roles/:id", () => {
      afterEach(() => {
        jest.clearAllMocks();
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


      it("should return a role when a valid ID is provided", async () => {
        // Mock the roleController.find method to return a role
        const mockRole = { id: 1, name: "TestRole" } as Role;
        jest.spyOn(roleController, "find").mockResolvedValueOnce(mockRole);
  
        const response = await request(app)
          .get("/roles/1")
          .set('Authorization', `Bearer ${token}`)
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRole);
      });
  
      it("should return a 405 status and error message when the role does not exist", async () => {
        // Mock the roleController.find method to return null (role not found)
        jest.spyOn(roleController, "find").mockResolvedValueOnce(null);
  
        const response = await request(app)
          .get("/roles/1")
          .set('Authorization', `Bearer ${token}`)
  
        expect(response.status).toBe(405);
        
        expect(response.body).toEqual({ message: "Role with ID [1] does not exist." });
      });
  
      it("should return a 500 status and error message when an unexpected error occurs", async () => {
        // Mock the roleController.find method to throw an error
        const errorMessage = "Unexpected error";
        jest.spyOn(roleController, "find").mockRejectedValueOnce(new Error(errorMessage));
  
        const response = await request(app)
          .get("/roles/1")
          .set('Authorization', `Bearer ${token}`)
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Error getting the role." });
      });
    });

    describe("PUT /roles/:id", () => {
      afterEach(() => {
        jest.clearAllMocks();
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

      it("should update a role when a valid ID is provided", async () => {
        // Mock the roleController.find method to return an existing role
        const mockExistingRole = { id: 1, name: "ExistingRole" } as Role;
        jest.spyOn(roleController, "find").mockResolvedValueOnce(mockExistingRole);
  
        // Mock the roleController.edit method to return the updated role
        const updatedRoleData = { id: 1, name: "UpdatedRole" } as Role;
        jest.spyOn(roleController, "edit").mockResolvedValueOnce(updatedRoleData);
  
        const response = await request(app)
          .put("/roles/1")
          .set('Authorization', `Bearer ${token}`)
          .send({ name: "UpdatedRole" });
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: `Role with name [${updatedRoleData.name}] has been successfully modified.`,
          data: updatedRoleData
        });
        expect(roleController.edit).toHaveBeenCalledTimes(1);
        expect(roleController.edit).toHaveBeenCalledWith(1, { name: "UpdatedRole" });
      });
  
      it("should return a 404 status and error message when the role does not exist", async () => {
        // Mock the roleController.find method to return null (role not found)
        jest.spyOn(roleController, "find").mockResolvedValueOnce(null);
  
        const response = await request(app)
          .put("/roles/1")
          .set('Authorization', `Bearer ${token}`)
          .send({ name: "UpdatedRole" });
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Role with ID [1] does not exist." });
        expect(roleController.edit).not.toHaveBeenCalled();
      });
  
      it("should return a 500 status and error message when an unexpected error occurs", async () => {
        // Mock the roleController.find method to throw an error
        const errorMessage = "Unexpected error";
        jest.spyOn(roleController, "find").mockRejectedValueOnce(new Error(errorMessage));
  
        const response = await request(app)
          .put("/roles/1")
          .set('Authorization', `Bearer ${token}`)

          .send({ name: "UpdatedRole" });
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Error modifying the role." });
        expect(roleController.edit).not.toHaveBeenCalled();
      });
    });

    describe("DELETE /roles/:id", () => {
      afterEach(() => {
        jest.clearAllMocks();
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

      it("should delete a role when a valid ID is provided", async () => {
        // Mock the roleController.find method to return an existing role
        const mockExistingRole = { id: 1, name: "ExistingRole" } as Role;
        jest.spyOn(roleController, "find").mockResolvedValueOnce(mockExistingRole);
  
        // Mock the roleController.destroy method to return the deleted role
        const deletedRoleData = { id: 1, name: "DeletedRole" } as Role;
        jest.spyOn(roleController, "destroy").mockResolvedValueOnce(deletedRoleData);
  
        const response = await request(app)
          .delete("/roles/1")
          .set('Authorization', `Bearer ${token}`)
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: `Role with name [${deletedRoleData.name}] has been deleted.`,
          data: deletedRoleData
        });
        expect(roleController.destroy).toHaveBeenCalledTimes(1);
        expect(roleController.destroy).toHaveBeenCalledWith(1, mockExistingRole);
      });
  
      it("should return a 404 status and error message when the role does not exist", async () => {
        // Mock the roleController.find method to return null (role not found)
        jest.spyOn(roleController, "find").mockResolvedValueOnce(null);
  
        const response = await request(app)
          .delete("/roles/1")
          .set('Authorization', `Bearer ${token}`)
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Role with ID [1] does not exist." });
        expect(roleController.destroy).not.toHaveBeenCalled();
      });
  
      it("should return a 500 status and error message when an unexpected error occurs", async () => {
        // Mock the roleController.find method to throw an error
        const errorMessage = "Unexpected error";
        jest.spyOn(roleController, "find").mockRejectedValueOnce(new Error(errorMessage));
  
        const response = await request(app)
          .delete("/roles/1")
          .set('Authorization', `Bearer ${token}`)
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Error deleting the role." });
        expect(roleController.destroy).not.toHaveBeenCalled();
      });
    });

    describe("POST /roles/:id/permissions", () => {
      afterEach(() => {
        jest.clearAllMocks();
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

      it("should assign permissions to a role when a valid ID and permission IDs are provided", async () => {
        const roleId = 1;
        const permissionIds = [1, 2, 3];
  
        // Mock the roleController.createRolePermission method to return the role with assigned permissions
        const assignedRole = { id: roleId, name: "TestRole", permissions: permissionIds } as unknown as Role;
        jest.spyOn(roleController, "createRolePermission").mockResolvedValueOnce(assignedRole);
  
        const response = await request(app)
          .post(`/roles/${roleId}/permissions`)
          .set('Authorization', `Bearer ${token}`)
          .send({ permissionIds });
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: `Permissions assigned to role with ID ${roleId}`,
          data: assignedRole
        });
        expect(roleController.createRolePermission).toHaveBeenCalledTimes(1);
        expect(roleController.createRolePermission).toHaveBeenCalledWith(permissionIds, roleId);
      });
  
      it("should return a 500 status and error message when an unexpected error occurs", async () => {
        const roleId = 1;
        const permissionIds = [1, 2, 3];
  
        // Mock the roleController.createRolePermission method to throw an error
        const errorMessage = "Unexpected error";
        jest.spyOn(roleController, "createRolePermission").mockRejectedValueOnce(new Error(errorMessage));
  
        const response = await request(app)
          .post(`/roles/${roleId}/permissions`)
          .set('Authorization', `Bearer ${token}`)
          .send({ permissionIds });
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Error assigning permissions to the role." });
        expect(roleController.createRolePermission).toHaveBeenCalledTimes(1);
        expect(roleController.createRolePermission).toHaveBeenCalledWith(permissionIds, roleId);
      });
    });
  
    describe("PUT /roles/:id/permissions", () => {
      afterEach(() => {
        jest.clearAllMocks();
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
      it("should update permissions for a role when a valid ID and permission IDs are provided", async () => {
        const roleId = 1;
        const permissionIds = [4, 5, 6];
  
        // Mock the roleController.editRolePermissions method to return the role with updated permissions
        const updatedRole = { id: roleId, name: "TestRole", permissions: permissionIds } as unknown as Role;
        jest.spyOn(roleController, "editRolePermissions").mockResolvedValueOnce(updatedRole);
  
        const response = await request(app)
          .put(`/roles/${roleId}/permissions`)
          .set('Authorization', `Bearer ${token}`)
          .send({ permissionIds });
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: `Permissions updated for role with ID ${roleId}`,
          data: updatedRole
        });
        expect(roleController.editRolePermissions).toHaveBeenCalledTimes(1);
        expect(roleController.editRolePermissions).toHaveBeenCalledWith(permissionIds, roleId);
      });
  
      it("should return a 500 status and error message when an unexpected error occurs", async () => {
        const roleId = 1;
        const permissionIds = [4, 5, 6];
  
        // Mock the roleController.editRolePermissions method to throw an error
        const errorMessage = "Unexpected error";
        jest.spyOn(roleController, "editRolePermissions").mockRejectedValueOnce(new Error(errorMessage));
  
        const response = await request(app)
          .put(`/roles/${roleId}/permissions`)
          .set('Authorization', `Bearer ${token}`)
          .send({ permissionIds });
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Error updating role permissions." });
        expect(roleController.editRolePermissions).toHaveBeenCalledTimes(1);
        expect(roleController.editRolePermissions).toHaveBeenCalledWith(permissionIds, roleId);
      });
    });
});
