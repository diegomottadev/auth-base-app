import { Role } from "../../../models/role.model"
import { Op } from 'sequelize';
import { RoleNotExist } from './roles.error';
import { Permission } from "../../../models/permissio.model";
export const create = async (role: { name: string }): Promise<Role> => {
  const roleCreated = await Role.create({
    name: role.name,
  });

  return roleCreated;
};

export const all = (): Promise<Role[]> => {
  return Role.findAll({ 
    include: [Permission],
    where: {
      id: { [Op.not]: null },
    },
  });
};

export const find = (id: number | null = null, name: string | null = null): Promise<Role | null> => {
  if (id) return Role.findOne({ where: { id: parseInt(id.toString()) } });
  if (name) return Role.findOne({ where: { name: name } });

  throw new Error('No especifico un parametro para buscar el rol');
};

export const roleExist = ({ name }: { name: string }): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    Role.findAll({
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

export const destroy = async (id: number, roleToDelete: Role): Promise<Role> => {
  const hasPermissions = await roleToDelete.$count("permissions");

  if (hasPermissions > 0) {
    throw new Error("Role cannot be deleted because it has associated permissions.");
  }

  await Role.destroy({
    where: {
      id: id,
    },
  });

  return roleToDelete;
};


export const createRolePermission = async  (permissionIds: number[], roleId: number): Promise<Role  | null> => {
  
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

