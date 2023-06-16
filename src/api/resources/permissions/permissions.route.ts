import express, { Request, Response } from 'express';
import passport from 'passport';

import * as permissionController from './permissions.controller';
import { procesarErrores } from '../../libs/errorHandler';
import {  PermissionNotExist } from './permissions.error';

const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const permissionsRouter = express.Router();


permissionsRouter.get('/', [jwtAuthenticate], procesarErrores(async (_req: Request, res: Response) => {
  try {
    const roles = await permissionController.all();
    res.json({ data: roles });
  } catch (error) {
    // Handle the error
    res.status(500).json({ message: 'Error al obtener todos los roles.' });
  }
}));

permissionsRouter.get('/:id',[jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const role = await permissionController.find(id);
    if (!role) {
      throw new PermissionNotExist(`Permiso con id [${id}] no existe.`);
    }
    res.json(role);
  } catch (error) {
    // Manejar el error
    if (error instanceof PermissionNotExist) {
      res.status(405).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener el permiso.' });
    }  
  }
}));


export default permissionsRouter;
