import { create as createRole, createRolePermission, find as findRole } from './../../src/api/resources/roles/roles.controller';
import { loadPermissions, find as findPermission } from './../../src/api/resources/permissions/permissions.controller';

// Create roles 'ADMIN', 'User', and 'Guest' if they don't exist
const createRoles = async () => {
  const roles = ['ADMIN', 'User', 'Guest'];

  for (const roleName of roles) {
    const existingRole = await findRole(null, roleName);
    console.log(!existingRole)
    if (!existingRole) {
      await createRole({ name: roleName });
      console.log(`Role '${roleName}' created.`);
    } else {
      console.log(`Role '${roleName}' already exists. Skipping creation.`);
    }
  }
};

// Assign permissions to roles if they don't already have them
const assignPermissionsToRoles = async () => {
  const createUserPermissions = ['Create', 'Read', 'List', 'Update', 'Delete'];
  const guestPermissions = ['Read', 'List'];

  const createUserRole = await findRole(null, 'User');
  const createGuestRole = await findRole(null, 'Guest');

  if (createUserRole) {
    for (const permissionName of createUserPermissions) {
      try {
        const permission = await findPermission(null, permissionName);
        if (permission) {
          const isPermissionAssigned = createUserRole.permissions.find(p => p.name === permission.name);
          if (!isPermissionAssigned) {
            // Assign the permission to the role
            await createRolePermission([permission.id], createUserRole.id);
            console.log(`Permission '${permissionName}' assigned to role 'User'.`);
          } else {
            console.log(`Permission '${permissionName}' already assigned to role 'User'. Skipping assignment.`);
          }
        } else {
          console.log(`Permission '${permissionName}' not found. Skipping assignment.`);
        }
      } catch (error) {
        console.log(`Error assigning permission '${permissionName}' to role 'User': ${error}`);
      }
    }
  }

  if (createGuestRole) {
    for (const permissionName of guestPermissions) {
      try {
        const permission = await findPermission(null, permissionName);
        if (permission) {
          const isPermissionAssigned = createGuestRole.permissions.find(p => p.name === permission.name);
          if (!isPermissionAssigned) {
            // Assign the permission to the role
            await createRolePermission([permission.id], createGuestRole.id);
            console.log(`Permission '${permissionName}' assigned to role 'Guest'.`);
          } else {
            console.log(`Permission '${permissionName}' already assigned to role 'Guest'. Skipping assignment.`);
          }
        } else {
          console.log(`Permission '${permissionName}' not found. Skipping assignment.`);
        }
      } catch (error) {
        console.log(`Error assigning permission '${permissionName}' to role 'Guest': ${error}`);
      }
    }
  }
}

// Create roles and assign permissions if the database exists
export const initializeDatabase = async () => {
  try {
    //await createRoles();
    //await loadPermissions();
    await assignPermissionsToRoles();
  } catch (error) {
    console.log(`Error loading permissions: ${error}`);
  }
};
