import { Permission } from "../../../models/permissio.model";
import { Role } from "../../../models/role.model";
import { User } from "../../../models/user.model"
import { Op } from 'sequelize';

export const create = async (user: { name: string; email: string; roleId: string }, password: string): Promise<User> => {
  const { name, email, roleId } = user;

  const userCreated = await User.create({
    name: name,
    email: email,
    password: password,
    roleId: roleId,
    active: true,
  }, {
    include: [Role],
  });

  return userCreated;
};

export const all = (): Promise<User[]> => {
  return User.findAll({
    include: [Role],
    where: {
      id: { [Op.not]: null },
    },
  });
};

export const find = (id: number | null = null, name: string | null = null, email: string | null = null): Promise<User | null> => {
  if (id) return User.findOne({ include: [Role], where: { id: parseInt(id.toString()) } });
  if (email) return User.findOne({  include: [Role],where: { email: email } });
  if (name) return User.findOne({  include: [Role], where: { name: name } });

  throw new Error('No especifico un parametro para buscar el usuario');
};

export const findByEmail = (email: string): Promise<User | null> => {
  if (email) return User.findOne({  include: [Role], where: {
    [Op.or]: [
      { email: email },
      { name: email }
    ]
  }}
);

  throw new Error('No especifico un email para buscar el usuario');
};

export const userExist = ({ email }: { email: string }): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    User.findAll({ 
      include: [Role],
      where: { email: email },
    })
      .then((users) => {
        resolve(users.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const edit = (id: number, user: { name: string; email: string }): Promise<User | null> => {
  return new Promise<User | null>((resolve, reject) => {
    User.update(
      {
        name: user.name,
        email: user.email,
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

export const destroy = (id: number, userToDelete: User): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    User.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve(userToDelete);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const checkUserRolePermission = async (authenticatedUserId: number, permission: string): Promise<boolean> => {
  try {
    // Retrieve the authenticated user
    const authenticatedUser = await User.findByPk(authenticatedUserId, {
      include: [
        {
          model: Role,
          include: [Permission],
        },
      ],
    });

    // Retrieve all roles
    const roles = await Role.findAll();

    // Check if both the authenticated user and roles exist
    if (!authenticatedUser || !roles) {
      return false;
    }

    // Get the role name of the authenticated user
    const authenticatedUserRoleName = authenticatedUser.role?.name;

    // Check if the authenticated user's role name matches any of the roles in the system
    const hasMatchingRole = roles.some((systemRole) => systemRole.name === authenticatedUserRoleName);

    // Check if the authenticated user has the necessary permission
    const hasPermission = authenticatedUser.role?.permissions?.some((permissionObj) => permissionObj.name === permission);

    return hasMatchingRole && hasPermission;
  } catch (error) {
    throw new Error("Error checking user role and permission");
  }
};
