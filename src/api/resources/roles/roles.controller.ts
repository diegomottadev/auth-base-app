import { Role } from "../../../models/role.model"
import { Op } from 'sequelize';
import { RoleNotExist } from './roles.error';
import { Permission } from "../../../models/permission.model";


/*

This function creates a new role with the provided name. 
It returns a Promise that resolves to the created role object.

*/

export const create = async (role: { name: string }): Promise<Role> => {
  const roleCreated = await Role.create({ include: [Permission],
    name: role.name,
  });

  return roleCreated;
};

/*

 This function retrieves all roles from the database, including their associated permissions. 
 It returns a Promise that resolves to an array of role objects.

*/

export const all = (): Promise<Role[]> => {
  return Role.findAll({ 
    include: [Permission],
    where: {
      id: { [Op.not]: null },
    },
  });
};

/*

This function finds a role based on the provided ID or name. 
If an ID or name is provided, it searches for the role using that parameter. 
If neither is provided, it throws an error. 
It returns a Promise that resolves to the found role object or null if no role is found.

*/

export const find = (id: number | null = null, name: string | null = null): Promise<Role | null> => {
  if (id) {
    return Role.findOne({
      include: [Permission],
      where: { id: parseInt(id.toString()) }
    }) as Promise<Role | null>;
  }
  if (name) {
    return Role.findOne({
      include: [Permission],
      where: { name: name }
    }) as Promise<Role | null>;
  }

  throw new Error('No se especificó un parámetro para buscar el rol');
};



/*

 This function checks if a role with the provided name already exists in the database.
 It returns a Promise that resolves to a boolean value indicating whether the role exists or not.

*/

export const roleExist = ({ name }: { name: string }): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    Role.findAll({
      include: [Permission],
      where: { name: name },
    })
      .then((roles) => {
        resolve(roles.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/*

 This function updates the name of a role with the provided ID. 
 It returns a Promise that resolves to the updated role object or null if no role is found with the given ID.

*/

export const edit = (id: number, role: { name: string }): Promise<Role | null> => {
  return new Promise<Role | null>((resolve, reject) => {
    Role.update(
      {
        name: role.name
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then(() => {
        let response = find(id);
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/*

 This function deletes a role with the provided ID. 
 It first checks if the role has associated permissions, and if so, it throws an error indicating that the role cannot be deleted. 
 If the role doesn't have any associated permissions, it deletes the role from the database and returns the deleted role object.

*/

export const destroy = async (id: number, roleToDelete: Role ): Promise<Role> => {
  const hasPermissions = await roleToDelete?.$count("permissions");

  if (hasPermissions && hasPermissions > 0) {
    /* TODO:

        Create a customized Exception about this error
    
    */
    throw new Error("Role cannot be deleted because it has associated permissions.");
  }

  await Role.destroy({
    where: {
      id: id,
    },
  });

  return roleToDelete;
};

/*

This function assigns permissions to a role. 
It takes an array of permission IDs and a role ID. 
It retrieves the role from the database and checks if it exists. 
If the provided permission IDs are not empty, it retrieves the corresponding permission objects and assigns them to the role. 
If no permission IDs are provided, it removes all existing permissions from the role. 
It returns a Promise that resolves to the updated role object or null if the role doesn't exist

*/

export const createRolePermission = async (permissionIds: number[], roleId: number): Promise<Role | null> => {
  let role: Role | null;

  role = await Role.findByPk(roleId, {
    include: [Permission],
  });

  if (!role) {
    throw new RoleNotExist();
  }

  // Find existing permission IDs assigned to the role
  const existingPermissionIds = role.permissions.map((permission) => permission.id);

  // Filter out the permission IDs that are already assigned to the role
  const newPermissionIds = permissionIds.filter((permissionId) => !existingPermissionIds.includes(permissionId));
    // Assign new permission IDs to the role
  await role.$add("permissions", newPermissionIds);

  // Refresh the role to include the updated permissions
  const roleWithPermission = await Role.findByPk(roleId, {
    include: [Permission],
  });

  return roleWithPermission;
};


// export const createRolePermission = async  (permissionIds: number[], roleId: number): Promise<Role  | null> => {
  
//   let role: Role | null;

//   role = await Role.findByPk(roleId, {
//     include: [Permission],
//   });

//   if (!role) {
//     throw new RoleNotExist();
//   }

//   // Assign new permissions to the role
//   if (permissionIds && permissionIds.length > 0) {
//     const permissions = await Permission.findAll({
//       where: { id: permissionIds },
//     });

//     await role.$set("permissions", permissions);

//     // Refresh the role to include the updated permissions
//     role = await Role.findByPk(roleId, {
//       include: [Permission],
//     });
//   } else {
//     // If no permissions are provided, remove all existing permissions from the role
//     await role.$set("permissions", []);

//     // Refresh the role to reflect the removed permissions
//     role = await Role.findByPk(roleId, {
//       include: [Permission],
//     });
//   }

//   return role;

// };


/*

 This function is similar to createRolePermission but is used for editing existing role permissions. 
 It retrieves the role from the database, assigns new permissions or 
 removes existing permissions based on the provided permission IDs, 
 and returns the updated role object or null if the role doesn't exist.

*/

export const editRolePermissions = async (permissionIds: number[], roleId: number): Promise<Role | null > => {
    let role: Role | null;

    role = await Role.findByPk(roleId, {
      include: [Permission],
    });

    if (!role) {
      throw new RoleNotExist();
    }

    // Assign new permissions to the role
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await Permission.findAll({
        where: { id: permissionIds },
      });
    
      await role.$set("permissions", permissions);

      // Refresh the role to include the updated permissions
      role = await Role.findByPk(roleId, {
        include: [Permission],
      });
    } else {
      // If no permissions are provided, remove all existing permissions from the role
      await role.$set("permissions", []);

      // Refresh the role to reflect the removed permissions
      role = await Role.findByPk(roleId, {
        include: [Permission],
      });
    }

    return role;

};

