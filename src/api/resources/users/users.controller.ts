import { Permission } from "../../../models/permissio.model";
import { Role } from "../../../models/role.model";
import { User } from "../../../models/user.model"
import { Op } from 'sequelize';

/*
 
 This function is used to create a new user. 
 It takes an object containing the user's name, email, and roleId (role ID) along with the password. 
 It creates a new user entry in the database with the provided information and returns the created user object

*/

export const create = async (user: { name: string; email: string; roleId: number }, password: string): Promise<User> => {
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

/*

 This function is used to retrieve all users from the database. 
 It returns a Promise that resolves to an array of User objects. 
 It uses the findAll method of the User model and includes the associated Role model. 
 The where clause ensures that only users with a valid ID are returned (ID is not null)

*/

export const all = (): Promise<User[]> => {
  return User.findAll({
    include: [Role],
    where: {
      id: { [Op.not]: null },
    },
  });
};


/* 

 This function is used to find a user based on the provided parameters. 
 It accepts three optional parameters: id, name, and email. 
 If id is provided, it finds the user by ID. If email is provided, it finds the user by email. 
 If name is provided, it finds the user by name. 
 It returns a Promise that resolves to the found user object or null if no user is found.

*/

export const find = (id: number | null = null, name: string | null = null, email: string | null = null): Promise<User | null> => {
  if (id) return User.findOne({ include: [Role], where: { id: parseInt(id.toString()) } });
  if (email) return User.findOne({  include: [Role],where: { email: email } });
  if (name) return User.findOne({  include: [Role], where: { name: name } });

  throw new Error('No especifico un parametro para buscar el usuario');
};


/*

 This function is used to find a user by their email. 
 It accepts an email parameter and searches for the user by email or name using the OR operator. 
 It returns a Promise that resolves to the found user object or null if no user is found.

*/

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

/*

 This function checks if a user with the specified email already exists. It accepts an object with an email property. 
 It returns a Promise that resolves to a boolean value indicating whether the user exists (true) or not (false).

*/

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

/*

 This function is used to edit a user's name and email. 
 It accepts an id parameter representing the user's ID and an object containing the new name and email values. 
 It updates the user's information in the database and returns a Promise that resolves to the updated user object or null if the user is not found.

*/

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

/*

This function is used to delete a user from the database. 
It accepts an id parameter representing the user's ID and the user object to be deleted. 
It removes the user from the database and returns a Promise that resolves to the deleted user object.

*/

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

/*

 The checkUserRolePermission function is responsible for checking if an authenticated user has 
 a specific permission based on their role.
 It accepts two parameters: authenticatedUserId, which represents the ID of the authenticated user, and permission, 
 which is the name of the permission being checked.

*/

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
    const isAdmin = authenticatedUserRoleName === 'ADMIN';
    const hasPermission = isAdmin || (authenticatedUser.role?.permissions?.some((permissionObj) => permissionObj.name === permission));

    return hasMatchingRole && hasPermission;
  } catch (error) {
    throw new Error("Error checking user role and permission");
  }
};

