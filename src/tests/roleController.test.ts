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
} from "../api/resources/roles/roles.controller"; // Ajusta la ruta al archivo donde se encuentra la función edit

jest.mock("../models/role.model", () => ({
  Role: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
    $add: jest.fn(),
    $set: jest.fn(),
    $count: jest.fn()
  },
}));

jest.mock('../models/permission.model', () => ({
  Permission: {
    findAll: jest.fn(),
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
          
          El método toHaveBeenCalledWith() se utiliza en las pruebas con Jest para verificar si
          una función ha sido llamada con ciertos argumentos específicos. 
          Utilizo toHaveBeenCalledWith() para verificar si la función 
          Role.create ha sido llamada con un objeto que tiene ciertas
          propiedades y valores. Se verifica si se ha llamado a Role.create
          con un objeto que incluye una propiedad include con el 
          valor [Permission] y una propiedad name con el valor role.name.
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
    /*
       El método .toBeDefined() se utiliza en las pruebas con Jest para verificar si un valor está definido. 
       Se puede utilizar para comprobar si una variable, objeto, función u otro tipo de valor tiene un valor asignado y no es undefined.
      */

    expect(roles).toBeDefined();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles).toEqual([createdRole1, createdRole2]);
  });

  describe("roleExist", () => {
    it("should check if a role exists", async () => {
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

      const roleExists = await roleExist(createdRole1);
      expect(roleExists).toBe(true);
    });
  });

  describe("edit", () => {
    it("should edit a role", async () => {
      const role = { name: "Updated Role" };
      const mockRole = {
        id: 7,
        name: role.name,
        permissions: [],
      } as unknown as Role;
      // Mock the dependencies
      // Simular el comportamiento de la función `update` del modelo `Role`
      const updateMock = jest
        .spyOn(Role, "update")
        .mockResolvedValue(mockRole.id);
      // Esta simulación imita el comportamiento de la función `update`, devolviendo el `id` del rol actualizado.

      // Simular el comportamiento de la función `findOne` del modelo `Role`
      const findMock = jest.spyOn(Role, "findOne").mockResolvedValue(mockRole);
      // Esta simulación imita el comportamiento de la función `findOne`, devolviendo el objeto `findRole`.
      // Esto asegura que cuando se llame a la función `findOne`, se resuelva con el objeto `findRole`.

      // Estas simulaciones nos permiten controlar el comportamiento de las funciones `update` y `findOne` en nuestras pruebas.
      // Podemos especificar los valores de retorno y hacer un seguimiento de si se llaman con los argumentos esperados.

      // Call the edit function
      /*
          El mocking se utiliza antes de llamar al método edit en las pruebas para controlar el comportamiento de las dependencias externas
          y permitir pruebas independientes, controlada y predecibles de la lógica del método.

          Al mockear las dependencias antes de llamar al método edit, se asegura que la prueba se ejecute de forma aislada y 
          que no se realicen operaciones reales en la base de datos o en otras partes del sistema.
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
      const permissionIds = [1, 2, 3]; // IDs válidos de permisos de tu base de datos
      const roleId = 1; // ID del rol
  
      const role = {
        id: roleId,
        name: 'Admin',
        permissions: [], // Permisos inicialmente vacíos
      } as unknown  as Role;

      role.$add = jest.fn().mockResolvedValue(0);

      const role2 = {
        id: roleId,
        name: 'Admin',
        permissions: [1,2,3], // Permisos inicialmente vacíos
      } as unknown  as Role;
     // role.$add = jest.fn().mockResolvedValue(3);

      // Mockear la función findByPk de Role
      const findByPkMock = jest.spyOn(Role, 'findByPk').mockResolvedValueOnce(role).mockResolvedValueOnce(role2);
  
      // Llamar a la función createRolePermission
      const updatedRole = await createRolePermission(permissionIds, roleId);
  
      // Verificar que se haya llamado findByPk con los parámetros correctos
      expect(findByPkMock).toHaveBeenCalledWith(roleId, { include: [Permission] });
  
      // Verificar que se hayan asignado correctamente los permisos
      expect(updatedRole).toBeDefined();
      expect(updatedRole?.id).toBe(roleId);
      expect(updatedRole?.permissions).toHaveLength(permissionIds.length);
      expect(updatedRole?.permissions.map((p: any) => p)).toEqual(permissionIds);
  
      // Restaurar la implementación original de findByPk
      findByPkMock.mockRestore();
    });
  });
  

  describe('editRolePermissions', () => {
    it('should update role permissions', async () => {
      const roleId = 1;
      const permissionIds = [1, 2, 3];
      const permissionIdsSend = [4, 5,6];
      // Crear un objeto de rol y definir los permisos iniciales
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


      // Configurar el mock de Role.findByPk para devolver el rol
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(role);
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(roleExpected);

      // Configurar el mock de Permission.findAll para devolver los permisos
      (Permission.findAll as jest.Mock).mockResolvedValueOnce([
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
        { id: 3, name: 'Permission 3' },
      ]);
  
      // Llamar a la función editRolePermissions
      const updatedRole = await editRolePermissions(permissionIds, roleId);
  
      // Verificar que se hayan realizado las llamadas esperadas
      expect(Role.findByPk).toHaveBeenCalledWith(roleId, { include: [Permission] });
      expect(Permission.findAll).toHaveBeenCalledWith({ where: { id: permissionIds } });
      expect(role.$set).toHaveBeenCalledWith('permissions', [
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
        { id: 3, name: 'Permission 3' },
      ]);
  
      // Verificar el resultado
      expect(updatedRole).toEqual(roleExpected);
      expect(updatedRole?.permissions).toHaveLength(3);

    });
  
    it('should remove all role permissions', async () => {
      const roleId = 1;
      const permissionIds: number[] = [];
  
      // Crear un objeto de rol y definir los permisos iniciales
      const role = {
        id: roleId,
        name: 'Admin',
        permissions: [{ id: 1, name: 'Permission 1' }, { id: 2, name: 'Permission 2' }],
      } as unknown as Role;

      role.$set = jest.fn().mockResolvedValue( [{ id: 1, name: 'Permission 1' }, { id: 2, name: 'Permission 2' }]);

      // Configurar el mock de Role.findByPk para devolver el rol
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(role);
  
      const roleExpected = {
        id: roleId,
        name: 'Admin',
        permissions: [],
      } as unknown as Role;

      roleExpected.$set = jest.fn().mockResolvedValue( []);

      // Configurar el mock de Role.findByPk para devolver el rol
      (Role.findByPk as jest.Mock).mockResolvedValueOnce(roleExpected);


      // Llamar a la función editRolePermissions
      const updatedRole = await editRolePermissions(permissionIds, role.id);
  
      // Verificar que se hayan realizado las llamadas esperadas
      expect(Role.findByPk).toHaveBeenCalledWith(roleId, { include: [Permission] });
      expect(role.$set).toHaveBeenCalledWith('permissions', []);
  
      // Verificar el resultado
      expect(updatedRole).toEqual(roleExpected);
      expect(updatedRole?.permissions).toHaveLength(0);
    });
  });
});