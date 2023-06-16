

import { Permission } from "../../../models/permissio.model"
import { Op } from 'sequelize';



export const all = (): Promise<Permission[]> => {
  return Permission.findAll({
    where: {
      id: { [Op.not]: null },
    },
  });
};

export const find = (id: number | null = null, name: string | null = null): Promise<Permission | null> => {
  if (id) return Permission.findOne({ where: { id: parseInt(id.toString()) } });
  if (name) return Permission.findOne({ where: { name: name } });

  throw new Error('No especifico un parametro para buscar el permiso');
};


export const loadPermissions = async () => {
    const permissions = ['Create', 'Read', 'Write', 'Delete', 'Deny'];
    try {  
      for (const permissionName of permissions) {
        await Permission.create({ name: permissionName });
        console.log(`Permission '${permissionName}' created.`);
      }
  
      console.log('Permissions loaded successfully.');
    } catch (error) {
      console.error('Error loading permissions:', error);
    } 
  };

