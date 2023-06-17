import express, { Request, Response } from 'express';
import passport from 'passport';
import log from '../utils/logger';
import * as permissionController from './permissions.controller';
import { procesarErrores } from '../../libs/errorHandler';
import {  PermissionNotExist } from './permissions.error';
import { checkUserRolePermission } from '../helpers/checkRolePermision.helper';

const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const permissionsRouter = express.Router();


/*

 This function handles a GET request to retrieve all permissions. 
 It requires JWT authentication. It calls the all() function from the permissionController to fetch all 
 permissions and sends the response with the retrieved data.

*/

permissionsRouter.get('/', [jwtAuthenticate,checkUserRolePermission('List')], procesarErrores(async (_req: Request, res: Response) => {
  try {
    const roles = await permissionController.all();
    res.json({ data: roles });
  } catch (error) {
    log.error(`Error getting all permissions.`);
    res.status(500).json({ message: 'Error getting all permissions.' });
  }
}));

/*

This function handles a GET request to retrieve a permission by its ID. It requires JWT authentication. 
It extracts the permission ID from the request parameters, calls the find() function from the permissionController to fetch 
the permission with the provided ID, and sends the response with the retrieved permission. 
If the permission is not found, it throws a custom PermissionNotExist error.


*/

permissionsRouter.get('/:id',[jwtAuthenticate,checkUserRolePermission('Read')], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const role = await permissionController.find(id);
    if (!role) {
      throw new PermissionNotExist(`Permission with ID [${id}] does not exist.`);
    }
    res.json(role);
  } catch (error) {
    // Manejar el error
    if (error instanceof PermissionNotExist) {
      log.warning(`${error.message}. Permission ID [${id}] does not exist`);
      res.status(405).json({ message: error.message });
    } else {
      log.error(`Error getting the permission with ID [${id}]`);
      res.status(500).json({ message: 'Error al obtener el permiso.' });
    }  
  }
}));


export default permissionsRouter;
