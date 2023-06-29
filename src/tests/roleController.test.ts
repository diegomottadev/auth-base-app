import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";

import {
  create,
  all,
  roleExist,
  edit,
  destroy,
  createRolePermission,
  editRolePermissions,
} from "../api/resources/roles/roles.controller"; // Adjust the path to the file where the edit function is located

// Mock the "../models/role.model" module
jest.mock("../models/role.model", () => ({
  Role: {
    // Mocked methods and attributes of the Role model
    create: jest.fn(),       // Mock the create method
    findAll: jest.fn(),      // Mock the findAll method
    findOne: jest.fn(),      // Mock the findOne method
    destroy: jest.fn(),      // Mock the destroy method
    update: jest.fn(),       // Mock the update method
    findByPk: jest.fn(),     // Mock the findByPk method
    $add: jest.fn(),         // Mock the $add attribute
    $set: jest.fn(),         // Mock the $set attribute
    $count: jest.fn(),       // Mock the $count attribute
  },
}));

// Mock the "../models/permission.model" module
jest.mock('../models/permission.model', () => ({
  Permission: {
    // Mocked methods and attributes of the Permission model
    findAll: jest.fn(),      // Mock the findAll method
  },
}));


describe("Role Controller", () => {
  describe("create", () => {
    it("should create a new role", async () => {
      const role = { name: "Test Role" };
      const createdRole = { id: 6, name: role.name, permissions: [] };

      jest.spyOn(Role, "create").mockResolvedValueOnce(createdRole);

      const result = await create(role);

      expect(result).toEqual(createdRole);

      /*
          
      The toHaveBeenCalledWith() method is used in Jest tests to verify if
      a function has been called with specific arguments.
      I use toHaveBeenCalledWith() to verify if the function
      Role.create has been called with an object that has certain
      properties and values. It checks if Role.create has been called
      with an object that includes a property include with the
      value [Permission] and a property name with the value role.name.
      */
      expect(Role.create).toHaveBeenCalledWith({
        include: [Permission],
        name: role.name,
      });
    });
  });

  it("should retrieve all roles", async () => {
    const role1 = { name: "Test Role 1" };
    const createdRole1 = {
      id: 7,
      name: role1.name,
      permissions: [],
    } as unknown as Role;
    const role2 = { name: "Test Role 2" };
    const createdRole2 = {
      id: 8,
      name: role2.name,
      permissions: [],
    } as unknown as Role;
  
    jest
      .spyOn(Role, "findAll")
      .mockResolvedValueOnce([createdRole1, createdRole2]);
  
    const roles = await all();
  
    // Verify that the roles array is defined, is an array, and matches the expected values
    expect(roles).toBeDefined();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles).toEqual([createdRole1, createdRole2]);
  });
  
  describe("edit", () => {
    it("should edit a role", async () => {
      const role = { name: "Updated Role" };
      const mockRole = {
        id: 7,
        name: role.name,
        permissions: [],
      } as unknown as Role;
      
      // Mock the behavior of the `update` function of the `Role` model
      const updateMock = jest
        .spyOn(Role, "update")
        .mockResolvedValue(mockRole.id);
      // This mock simulates the behavior of the `update` function, returning the `id` of the updated role.
  
      // Mock the behavior of the `findOne` function of the `Role` model
      const findMock = jest.spyOn(Role, "findOne").mockResolvedValue(mockRole);
      // This mock simulates the behavior of the `findOne` function, returning the `findRole` object.
      // This ensures that when the `findOne` function is called, it resolves with the `findRole` object.
  
      // These mocks allow us to control the behavior of the `update` and `findOne` functions in our tests.
      // We can specify the return values and track if they are called with the expected arguments.
  
      // Call the edit function
      /*
        Mocking is used before calling the edit method in the tests to control the behavior of external dependencies
        and allow independent, controlled, and predictable testing of the method's logic.
  
        By mocking the dependencies before calling the edit method, it ensures that the test runs in isolation
        and no actual operations are performed in the database or other parts of the system.
      */
      const editedRole = await edit(mockRole.id, mockRole);
  
      // Assertions
      expect(updateMock).toHaveBeenCalledWith(
        { name: "Updated Role" },
        { where: { id: 7 } }
      );
  
      expect(findMock).toHaveBeenCalledWith({
        include: [Permission],
        where: { id: 7 },
      });
  
      expect(editedRole).toEqual(mockRole);
  
      // Restore the mocked functions
      updateMock.mockRestore();
      findMock.mockRestore();
    });
  });

  it("should delete a role", async () => {
    const roleId = 1; // Proporciona un ID de rol válido de tu base de datos
    const roleToDelete = {
      id: roleId,
      name: "Test Role",
      permissions: [],

    } as unknown as Role; // Proporciona el objeto de rol a eliminar (si es necesario)
    roleToDelete.$count = jest.fn().mockResolvedValue(0);

    // Mock the dependencies
    const findMock = jest
      .spyOn(Role, "findOne")
      .mockResolvedValue(roleToDelete);
    const destroyMock = jest.spyOn(Role, "destroy").mockResolvedValue(1);

    // Call the destroy function
    const deletedRole = await destroy(roleId, roleToDelete);

    // Assertions
    expect(deletedRole).toBeDefined();
    expect(deletedRole?.id).toBe(roleId);

    // Restore the mocked functions
    findMock.mockRestore();
    destroyMock.mockRestore();
  });

  it("should throw an error when a role has associated permissions", async () => {
    const roleId = 1; // Proporciona un ID de rol válido con permisos asociados de tu base de datos
    const roleToDelete = {
      id: roleId,
      name: "Admin",
      permissions: [],
    } as unknown as Role; // Proporciona el objeto de rol a eliminar (si es necesario)
    // Mock the dependencies
    roleToDelete.$count = jest.fn().mockResolvedValue(1);

    const findMock = jest
      .spyOn(Role, "findOne")
      .mockResolvedValue(roleToDelete);
    const destroyMock = jest.spyOn(Role, "destroy").mockResolvedValue(0);

    // Call the destroy function and expect it to throw an error
    await expect(destroy(roleId, roleToDelete)).rejects.toThrow('Role cannot be deleted because it has associated permissions.');


    // Restore the mocked functions
    findMock.mockRestore();
    destroyMock.mockRestore();
  });


  describe('createRolePermission', () => {
    it('should assign permissions to a role', async () => {
      const permissionIds = [1, 2, 3]; // Valid permission IDs from your database
      const roleId = 1; // ID of the role
  
      const role = {
        id: roleId,
        name: 'Admin',
        permissions: [], // Initially empty permissions
      } as unknown  as Role;
  
      role.$add = jest.fn().mockResolvedValue(0);
  
      const role2 = {
        id: roleId,
        name: 'Admin',
        permissions: [1,2,3], // Initially empty permissions
      } as unknown  as Role;
  
      // Mock the findByPk function of Role
      const findByPkMock = jest.spyOn(Role, 'findByPk').mockResolvedValueOnce(role).mockResolvedValueOnce(role2);
  
      // Call the createRolePermission function
      const updatedRole = await createRolePermission(permissionIds, roleId);
  
      // Verify that findByPk was called with the correct parameters
      expect(findByPkMock).toHaveBeenCalledWith(roleId, { include: [Permission] });
  
      // Verify that the permissions were assigned correctly
      expect(updatedRole).toBeDefined();
      expect(updatedRole?.id).toBe(roleId);
      expect(updatedRole?.permissions).toHaveLength(permissionIds.length);
      expect(updatedRole?.permissions.map((p: any) => p)).toEqual(permissionIds);
  
      // Restore the original implementation of findByPk
      findByPkMock.mockRestore();
    });
  });
  
  describe('editRolePermissions', () => {
    it('should update role permissions', async () => {
      const roleId = 1;
      const permissionIds = [1, 2, 3];
      const permissionIdsSend = [4, 5, 6];
  
      // Create a role object and set the initial permissions
      const role = {
        id: roleId,
        name: 'Admin',
        permissions: permissionIdsSend,
      } as unknown as Role;
      role.$set = jest.fn().mockResolvedValue(0);
  
      const roleExpected = {
        id: roleId,
        name: 'Admin',
        permissions: permissionIds,
      } as unknown as Role;
  
      // Mock the Role.findByPk to return the role
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(role);
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(roleExpected);
  
      // Mock the Permission.findAll to return the permissions
      (Permission.findAll as jest.Mock).mockResolvedValueOnce([
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
        { id: 3, name: 'Permission 3' },
      ]);
  
      // Call the editRolePermissions function
      const updatedRole = await editRolePermissions(permissionIds, roleId);
  
      // Verify the expected function calls
      expect(Role.findByPk).toHaveBeenCalledWith(roleId, { include: [Permission] });
      expect(Permission.findAll).toHaveBeenCalledWith({ where: { id: permissionIds } });
      expect(role.$set).toHaveBeenCalledWith('permissions', [
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
        { id: 3, name: 'Permission 3' },
      ]);
  
      // Verify the result
      expect(updatedRole).toEqual(roleExpected);
      expect(updatedRole?.permissions).toHaveLength(3);
    });
  
    it('should remove all role permissions', async () => {
      const roleId = 1;
      const permissionIds: number[] = [];
  
      // Create a role object and set the initial permissions
      const role = {
        id: roleId,
        name: 'Admin',
        permissions: [{ id: 1, name: 'Permission 1' }, { id: 2, name: 'Permission 2' }],
      } as unknown as Role;
  
      role.$set = jest.fn().mockResolvedValue([{ id: 1, name: 'Permission 1' }, { id: 2, name: 'Permission 2' }]);
  
      // Mock the Role.findByPk to return the role
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(role);
  
      const roleExpected = {
        id: roleId,
        name: 'Admin',
        permissions: [],
      } as unknown as Role;
  
      roleExpected.$set = jest.fn().mockResolvedValue([]);
  
      // Mock the Role.findByPk to return the role
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(roleExpected);
  
      // Call the editRolePermissions function
      const updatedRole = await editRolePermissions(permissionIds, role.id);
  
      // Verify the expected function calls
      expect(Role.findByPk).toHaveBeenCalledWith(roleId, { include: [Permission] });
      expect(role.$set).toHaveBeenCalledWith('permissions', []);
  
      // Verify the result
      expect(updatedRole).toEqual(roleExpected);
      expect(updatedRole?.permissions).toHaveLength(0);
    });
  });
  
});