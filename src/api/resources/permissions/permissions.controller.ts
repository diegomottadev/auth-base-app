

import { Permission } from "../../../models/permission.model"
import { Op } from 'sequelize';

/*

The all function retrieves all permissions from the database. 
It uses the Permission model to call the findAll method with a query to filter out permissions with a non-null ID. 
It returns a promise that resolves to an array of Permission objects.

*/

export const all = (): Promise<Permission[]> => {
  return Permission.findAll({
    where: {
      id: { [Op.not]: null },
    },
  });
};

/*

The find function is used to find a permission by either its ID or name. 
It accepts two optional parameters: id and name. If id is provided, it searches for a permission with that ID. 
If name is provided, it searches for a permission with that name. If neither parameter is specified, an error is thrown.

*/

export const find = (id: number | null = null, name: string | null = null): Promise<Permission | null> => {
  if (id) {
    return Permission.findOne({ where: { id: parseInt(id.toString()) } });
  }
  if (name) {
    return Permission.findOne({ where: { name: name } });
  }

  throw new Error('No specified a parameter to search for the permission');
};


// Load permissions into the database
export const loadPermissions = (): Promise<void> => {
  const permissions = ['Create', 'Read', 'Write', 'Update', 'Delete', 'List', 'Deny'];
  return new Promise<void>(async (resolve, reject) => {
    try {
      for (const permissionName of permissions) {
        const existingPermission = await Permission.findOne({ where: { name: permissionName } });
        if (!existingPermission) {
          await Permission.create({ name: permissionName });
          console.log(`Permission '${permissionName}' created.`);
        } else {
          //console.log(`Permission '${permissionName}' already exists. Skipping creation.`);
        }
      }

      //console.log('Permissions loaded successfully.');
      resolve();
    } catch (error) {
      console.error('Error loading permissions:', error);
      reject(error);
    }
  });
};
