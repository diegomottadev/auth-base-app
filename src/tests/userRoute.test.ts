import request from "supertest";
import { app, server } from "../index"; // Import your Express app and server
import { disconnectDB } from "../connection/connection";
import * as userController from '../api/resources/users/users.controller';
import { User } from "../models/user.model";
import bcrypt from 'bcrypt';
// import { UserNotExist } from "../api/resources/users/users.error";


// ...
describe("Users", () => {
    afterAll(async () => {
        server.close(); // Close the server to stop accepting new connections
      
        await disconnectDB(); // Disconnect from the database
      
        // Clean up any remaining resources or perform final operations
      });
    describe("POST /users", () => {
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

        it("should create a new user when valid user data is provided", async () => {
            const newUser = {
            name: "John Doe",
            email: "johndoe@example.com",
            password: "password123",
            roleId: 2
            };

            // Mock the userController.userExist method to return false (user does not exist)
            jest.spyOn(userController, "userExist").mockResolvedValueOnce(false);

            // Mock the bcrypt.hash method to return the hashed password
            const hashedPassword = await bcrypt.hash(newUser.password, 10) as never;
            jest.spyOn(bcrypt, "hash").mockResolvedValueOnce(hashedPassword);

            // Mock the userController.create method to return the created user
            const createdUser = { id: 1, name: newUser.name, email: newUser.email } as User;
            //jest.spyOn(userController, "create").mockResolvedValueOnce(createdUser);

            jest.spyOn(userController, "create").mockImplementationOnce(async (user, password) => {
            expect(user).toEqual(newUser);
            expect(password).toEqual(hashedPassword);
            return createdUser;
            });

            const response = await request(app)
            .post("/users")
            .set('Authorization', `Bearer ${token}`)
            .send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toEqual({
            message: `User with name [${createdUser.name}] created successfully.`,
            data: createdUser.name
            });
            /*
            
            toHaveBeenCalledTimes(n): Esta función verifica que la función espiada o mockeada haya sido llamada exactamente n veces. 
                                     Si el número de llamadas no coincide con n, la prueba fallará.

            toHaveBeenCalledWith(arg1, arg2, ...): Esta función verifica que la función espiada o mockeada haya sido llamada 
                                                   al menos una vez con los argumentos especificados. 
                                                   Los argumentos deben coincidir exactamente en orden y valor. Si no se encuentra ninguna llamada 
                                                   con los argumentos especificados, la prueba fallará.
            
            */
            expect(userController.userExist).toHaveBeenCalledTimes(1);
            expect(userController.userExist).toHaveBeenCalledWith(newUser);
            expect(bcrypt.hash).toHaveBeenCalledTimes(1);
            expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
            expect(userController.create).toHaveBeenCalledTimes(1);
            expect(userController.create).toHaveBeenCalledWith(newUser, hashedPassword);
        });

        it("should return a 409 status and error message when user data is already in use", async () => {
            const newUser = {
            name: "John Doe",
            email: "johndoe@example.com",
            password: "password123",
            roleId: 2
            };

            // Mock the userController.userExist method to return true (user already exists)
            jest.spyOn(userController, "userExist").mockResolvedValueOnce(true);

            const response = await request(app)
            .post("/users")
            .set('Authorization', `Bearer ${token}`)
            .send(newUser);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({ message: "The email or username or phone number is already associated with an account." });
            expect(userController.userExist).toHaveBeenCalledTimes(1);
            expect(userController.userExist).toHaveBeenCalledWith(newUser);
        });

        it("should return a 500 status and error message when an unexpected error occurs", async () => {
            const newUser = {
              name: "John Doe",
              email: "johndoe@example.com",
              password: "password123",
              roleId: 2
            };
        
            // Mock the userController.userExist method to throw an error
            const errorMessage = "Unexpected error";
            jest.spyOn(userController, "userExist").mockRejectedValueOnce(new Error(errorMessage));
        
            const response = await request(app)
              .post("/users")
              .set('Authorization', `Bearer ${token}`)
              .send(newUser);
        
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Error creating the user." });
            expect(userController.userExist).toHaveBeenCalledTimes(1);
            expect(userController.userExist).toHaveBeenCalledWith(newUser);
        });
        
    });

    describe("GET /users", () => {
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        let token: string;
      
        beforeAll(async () => {
          // Perform login and obtain the JWT token
          const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@admin.com', password: 'admin' });
      
          // Extract the JWT token from the login response
          token = loginResponse.body.token;
        });
      
        it("should retrieve all users when the request is made by an authenticated user with 'List' permission", async () => {
          const users = [{ id: 1, name: "John Doe", email: "johndoe@example.com" }] as User[];
      
          // Mock the userController.all() method to return the users
          jest.spyOn(userController, "all").mockResolvedValueOnce(users);
      
          const response = await request(app)
            .get("/users")
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ data: users });
          expect(userController.all).toHaveBeenCalledTimes(1);
        });
      
        it("should return a 500 status and error message when an unexpected error occurs", async () => {
          const errorMessage = "Unexpected error";
      
          // Mock the userController.all() method to throw an error
          jest.spyOn(userController, "all").mockRejectedValueOnce(new Error(errorMessage));
      
          const response = await request(app)
            .get("/users")
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(500);
          expect(response.body).toEqual({ message: "Error retrieving all users." });
          expect(userController.all).toHaveBeenCalledTimes(1);
        });
    });
    describe("GET /users/:id", () => {
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        let token: string;
      
        beforeAll(async () => {
          // Login and get the JWT token
          const loginResponse = await request(app)
            .post("/auth/login")
            .send({ email: "admin@admin.com", password: "admin" });
      
          // Extract the JWT token from the login response
          token = loginResponse.body.token;
      

        });
      
        it("should retrieve a user by ID when the request is made by an authenticated user with 'Read' permission", async () => {
            const userId = 2; // ID ficticio
            const user = { id: userId, name: "user", email: "user@user.com" } as User;
          
            // Mock the userController.find() method to return the user
            jest.spyOn(userController, "find").mockResolvedValueOnce(user);
            jest.spyOn(userController, "checkUserRolePermission").mockResolvedValueOnce(true);
          
            const response = await request(app)
              .get(`/users/${userId}`)
              .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.name).toContain("user");
          
            expect(userController.find).toHaveBeenCalledTimes(2);
            expect(userController.find).toHaveBeenCalledWith(userId);
        });


      
        it("should return a 405 status and error message when an unexpected error occurs", async () => {
          const userId = 9;
      
          const response = await request(app)
            .get(`/users/${userId}`)
            .set("Authorization", `Bearer ${token}`);

          expect(response.status).toBe(405);
          expect(response.body).toEqual({ message: "User with ID [9] does not exist." });
        });
    });

    describe("PUT /users/:id", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
    
      let token: string;
    
      beforeAll(async () => {
        // Perform login and obtain the JWT token
        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ email: 'admin@admin.com', password: 'admin' });
    
        // Extract the JWT token from the login response
        token = loginResponse.body.token;
      });
    
      it("should update a user when valid user data is provided", async () => {
        const userId = 1;
        const userToUpdate = { id: userId, name: "John Doe", email: "johndoe@example.com" } as User;
        const updatedUser = { id: userId, name: "John Doe Updated", email: "johndoe@example.com" } as User;
    
        // Mock the userController.find() method to return the user to update
        jest.spyOn(userController, "find").mockResolvedValueOnce(userToUpdate);
    
        // Mock the userController.edit() method to return the updated user
        jest.spyOn(userController, "edit").mockResolvedValueOnce(updatedUser);
    
        const response = await request(app)
          .put(`/users/${userId}`)
          .set("Authorization", `Bearer ${token}`)
          .send(updatedUser);
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: `User with name [${updatedUser.name}] has been successfully updated.`,
          data: updatedUser,
        });
        expect(userController.find).toHaveBeenCalledTimes(2);
        expect(userController.find).toHaveBeenCalledWith(userId);
        expect(userController.edit).toHaveBeenCalledTimes(1);
        expect(userController.edit).toHaveBeenCalledWith(userId, updatedUser);
      });
    
      it("should return a 404 status and error message when the user to update does not exist", async () => {
        const userId = 9;
        const response = await request(app)
          .put(`/users/${userId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "John Doe Updated", email: "johndoe@example.com" });
    
        expect(response.status).toBe(404);
        //expect(response.type).toBe("text/html"); // Ensure the response is JSON
        expect(response.body).toEqual( {"message": "User with ID [9] does not exist."});

      });
    
      it("should return a 500 status and error message when an unexpected error occurs", async () => {
        const userId = 1;
      
        // Mock the userController.find() method to throw an error
        const errorMessage = "Unexpected error";
        jest.spyOn(userController, "find").mockRejectedValueOnce(new Error(errorMessage));
      
        const response = await request(app)
          .put(`/users/${userId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "John Doe Updated", email: "johndoe@example.com" });
      
        expect(response.status).toBe(500);
        expect(response.type).toBe("text/html"); // Ensure the response is JSON
        expect(response.text).toContain("Unexpected error");
        expect(userController.find).toHaveBeenCalledTimes(1);
        expect(userController.find).toHaveBeenCalledWith(userId);
        expect(userController.edit).not.toHaveBeenCalled();
      });
    });
    
    describe("DELETE /users/:id", () => {
      const id = 1;
      afterEach(() => {
        jest.clearAllMocks();
      });
      let token: string;
    
      beforeAll(async () => {
        // Perform login and obtain the JWT token
        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ email: 'admin@admin.com', password: 'admin' });
    
        // Extract the JWT token from the login response
        token = loginResponse.body.token;
      });
      describe("when the user exists", () => {
        beforeEach(() => {
          // Mock the userController.find() method to return a user
          jest.spyOn(userController, "find").mockResolvedValueOnce({ id, name: "Admin" } as User);
        });
       
        it("should return a 200 status and success message", async () => {
          // Mock the userController.destroy() method to return the deleted user
          jest.spyOn(userController, "destroy").mockResolvedValueOnce({ id, name: "Admin" } as User);
    
          const response = await request(app)
            .delete(`/users/${id}`)
            .set("Authorization", `Bearer ${token}`);
    
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            message: `User with name [Admin] has been deleted.`,
            data: { id, name: "Admin" }
          });
          
        });
      });
    
      describe("when the user does not exist", () => {
 
    
        it("should return a 404 status and error message", async () => {
          const response = await request(app)
            .delete(`/users/${9}`)
            .set("Authorization", `Bearer ${token}`);
    
          expect(response.status).toBe(404);

          expect(response.body).toEqual({ message: 'User with ID [9] does not exist.' });
        
        });
      });
    
      describe("when an error occurs during deletion", () => {
        beforeEach(() => {
          // Mock the userController.find() method to throw an error
          const errorMessage = "Unexpected error";
          jest.spyOn(userController, "find").mockRejectedValueOnce(new Error(errorMessage));
        });
    
        it("should return a 500 status and error message", async () => {
          const response = await request(app)
            .delete(`/users/${id}`)
            .set("Authorization", `Bearer ${token}`);
          expect(response.status).toBe(500);
          expect(response.type).toBe("text/html"); // Ensure the response is JSON
          expect(response.text).toContain("Unexpected error");
        });
      });
    });
    
      
});