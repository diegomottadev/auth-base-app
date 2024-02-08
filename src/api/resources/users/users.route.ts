/*

These are the basic functionalities of each endpoint:

  -POST /users: Creates a new user with the provided information and checks if the email or username already exists in the database.
  -GET /users: Retrieves all users from the database, ensuring that the user is authenticated and has the "List" permission.
  -GET /users/:id: Retrieves a specific user by ID, verifying that the user is authenticated and has the "Read" permission.
  -PUT /users/:id: Updates the information of an existing user by ID, requiring authentication and the "Update" permission.
  -DELETE /users/:id: Deletes an existing user by ID, ensuring that the user is authenticated and has the "Delete" permission.

*/

import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import log from '../utils/logger';
import * as userController from './users.controller';
import { InfoUserInUse, UserNotExist } from './users.error';
import { procesarErrores } from '../../libs/errorHandler';
import  { validationUser } from './users.validation';
import  { checkUserRolePermission } from './../helpers/checkRolePermision.helper';
import { Op } from 'sequelize';
const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const usersRouter = express.Router();

/*

  -Creates a new user in the database. 
  -It checks if the email or username already exists. 
  -If the validation is successful, the user is created with the hashed password and a successful response is returned. 
  -In case of an error, a response with the corresponding error message is sent.

*/
usersRouter.post('/', [jwtAuthenticate,checkUserRolePermission('Create'),validationUser ], procesarErrores(async (req: Request, res: Response) => {

  let newUser = req.body;
  try {
    const userExist = await userController.userExist(newUser);
    if (userExist) {
      log.warn(`Email [${newUser.email}] or name [${newUser.name}] already exists.`);
      throw new InfoUserInUse();
    }
    const hash = await bcrypt.hash(newUser.password, 10);
    const userCreated = await userController.create(newUser, hash);
    log.info(`User with ID [${userCreated.id}] has been successfully created.`);
    res.status(201).json({ message: `User with name [${userCreated.name}] created successfully.`, data: userCreated.name });
  } catch (error) {
    if (error instanceof InfoUserInUse) {
      log.warn(`${error.message}: ${newUser.email} | ${newUser.name}`);
      res.status(409).json({ message: error.message });
    } else {
      log.error(`Error creating the user with email [${newUser.email}] and name [${newUser.name}].`);
      res.status(500).json({ message: 'Error creating the user.' });
    }
  }
}));

/*

  -Retrieves all users from the database. 
  -Requires authentication and "List" permission. 
  -If the operation is successful, a response with the found users is returned. 
  -In case of an error, a response with the corresponding error message is sent.

*/
usersRouter.get('/', [jwtAuthenticate, checkUserRolePermission('List')], procesarErrores(async (_req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, name } = _req.query;
    let where: any = {
      id: { [Op.not]: null },
    };

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    const result = await userController.all(page as number, pageSize as number, where);
    
    // Ensure that result is an object with rows and count properties
    if ('rows' in result && 'count' in result) {
      res.json({ data: result.rows, count: result.count });
    } else {
      console.error('Unexpected result format:', result);
      res.status(500).json({ message: 'Unexpected result format.' });
    }
  } catch (error) {
    console.error('Error al obtener todos los roles:', error);
    res.status(500).json({ message: 'Error al obtener todos los roles.' });
  }
}));
/*

  -Retrieves a specific user by ID. Requires authentication and "Read" permission. 
  -If the user exists, a response with the user information is returned. 
  -In case of an error, a response with the corresponding error message is sent.

*/
usersRouter.get('/:id', [jwtAuthenticate, checkUserRolePermission('Read')], procesarErrores(async (_req: Request, res: Response) => {
  const id = parseInt(_req.params.id);

  try {
    const user = await userController.find(id);
    if (!user) {
      throw new UserNotExist(`User with ID [${id}] does not exist.`);
    }
    log.info(`Successfully retrieved user with ID [${id}].`);
    res.json(user);
  } catch (error) {
    if (error instanceof UserNotExist) {
      log.warn(`${error.message}. User with ID [${id}] not found.`);
      res.status(405).json({ message: error.message });
    } else {
      log.error(`Error retrieving user with ID [${id}].`);
      res.status(500).json({ message: 'Error retrieving user.' });
    }  
  }
}));

/* 

  -Updates an existing user by ID. 
  -Requires authentication and "Update" permission. 
  -If the user exists, it is updated with the provided information, and a successful response is returned. 
  -In case of an error, a response with the corresponding error message is sent.

*/

usersRouter.put('/:id', [jwtAuthenticate, checkUserRolePermission('Update')], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    let userToUpdate = await userController.find(id);
    if (!userToUpdate) {
      throw new UserNotExist(`User with ID [${id}] does not exist.`);
    }
    const userUpdated = await userController.edit(id, req.body);
    if (userUpdated) {
      log.info(`User with ID [${userUpdated.id}] has been successfully updated.`);
      res.json({ message: `User with name [${userUpdated.name}] has been successfully updated.`, data: userUpdated });
    }
  } catch (error) {
    if (error instanceof UserNotExist) {
      log.warn(`${error.message}. User with ID [${id}] not found.`);
      res.status(404).json({ message: error.message });
    } else {
      log.error(`Error updating user with ID [${id}].`);
      res.status(500).json({ message: 'Error updating user.' });
    }
  }
}));

/*

  -Deletes an existing user by ID. Requires authentication and "Delete" permission. 
  -If the user exists, it is deleted from the database, and a successful response is returned. 
  -In case of an error, a response with the corresponding error message is sent.

*/

usersRouter.delete('/:id', [jwtAuthenticate, checkUserRolePermission('Delete')], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    let userToDelete = await userController.find(id);
    if (!userToDelete) {
      throw new UserNotExist(`User with ID [${id}] does not exist.`);
    }
    userToDelete = await userController.destroy(id, userToDelete);
    log.info(`User with ID [${id}] has been deleted.`);
    res.json({ message: `User with name [${userToDelete.name}] has been deleted.`, data: userToDelete });
  } catch (error) {
    // Handle the error
    if (error instanceof UserNotExist) {
      log.warn(`${error.message}. User with ID [${id}] not found.`);
      res.status(404).json({ message: error.message });
    } else {
      log.error(`Error deleting user with ID [${id}].`);
      res.status(500).json({ message: 'Error deleting user.' });
    }
  }
}));


export default usersRouter;
