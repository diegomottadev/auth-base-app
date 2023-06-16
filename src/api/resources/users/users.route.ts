import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import log from '../utils/logger';
import * as userController from './users.controller';
import { InfoUserInUse, UserNotExist } from './users.error';
import { procesarErrores } from '../../libs/errorHandler';
import  { validationUser } from './users.validation';
import  { checkUserRolePermission } from './../helpers/checkRolePermision.helper';
const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const usersRouter = express.Router();

usersRouter.post('/', [validationUser], procesarErrores(async (req: Request, res: Response) => {
  let newUser = req.body;
  try {
    const userExist = await userController.userExist(newUser);
    if (userExist) {
      log.warn(`Email [${newUser.email}] o nombre [${newUser.name}] ya existen.`);
      throw new InfoUserInUse();
    }
    const hash = await bcrypt.hash(newUser.password, 10);
    const userCreated = await userController.create(newUser, hash);
    res.status(201).json({ message: `Usuario con nombre [${userCreated.name}] creado exitosamente.`, data: userCreated.name });
  } catch (error) {
    // Manejar el error
    if (error instanceof InfoUserInUse) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al crear el usuario.' });
    }
  }
}));

usersRouter.get('/', [jwtAuthenticate], procesarErrores(async (_req: Request, res: Response) => {
  try {
    const users = await userController.all();
    res.json({ data: users });
  } catch (error) {
    // Handle the error
    res.status(500).json({ message: 'Error al obtener todos los usuarios.' });
  }
}));

usersRouter.get('/:id',[jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const user = await userController.find(id);
    if (!user) {
      throw new UserNotExist(`Usuario con id [${id}] no existe.`);
    }
    res.json(user);
  } catch (error) {
    // Manejar el error
    if (error instanceof UserNotExist) {
      res.status(405).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener el usuario.' });
    }  
  }
}));

usersRouter.put('/:id',[jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

   try {
    let userToUpdate = await userController.find(id);
    if (!userToUpdate) {
      throw new UserNotExist(`El usuario con id [${id}] no existe.`);
    }
    const userUpdated = await userController.edit(id, req.body);
    if(userUpdated){
      res.json({ message: `El usuario con nombre [${userUpdated.name}] ha sido modificado con éxito.`, data: userUpdated });
      log.info(`El usuario con id [${userUpdated.id}] ha sido modificado con éxito.`);
    }

  } catch (error) {
    // Manejar el error
    if (error instanceof UserNotExist) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al modificar el usuario.' });
    }  
  }
}));

usersRouter.delete('/:id',[jwtAuthenticate,checkUserRolePermission('Delete')], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    let userToDelete = await userController.find(id);
    if (!userToDelete) {
      throw new UserNotExist(`El usuario con id [${id}] no existe.`);
    }
    userToDelete = await userController.destroy(id, userToDelete);
    log.info(`Usuario con id [${id}] fue eliminado.`);
    res.json({ message: `Usuario con nombre [${userToDelete.name}] fue eliminado.`, data: userToDelete });
  } catch (error) {
    // Manejar el error
    if (error instanceof UserNotExist) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar el usuario.' });
    }  
  }
}));

export default usersRouter;
