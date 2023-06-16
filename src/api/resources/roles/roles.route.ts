import express, { Request, Response } from 'express';
import passport from 'passport';
import log from '../utils/logger';
import * as roleController from './roles.controller';
import { InfoRoleInUse, RoleNotExist } from './roles.error';
import { procesarErrores } from '../../libs/errorHandler';
import  { validationRole } from './roles.validation';

const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const rolesRouter = express.Router();

rolesRouter.post('/', [jwtAuthenticate,validationRole], procesarErrores(async (req: Request, res: Response) => {
  let roleNew = req.body;
  try {
    const roleExist = await roleController.roleExist(roleNew);
    if (roleExist) {
      log.warn(`Rol con  nombre [${roleNew.name}] ya existe.`);
      throw new InfoRoleInUse();
    }
    const roleCreated = await roleController.create(roleNew);
    res.status(201).json({ message: `Rol con nombre [${roleCreated.name}] creado exitosamente.`, data: roleCreated.name });
  } catch (error) {
    // Manejar el error
    if (error instanceof InfoRoleInUse) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al crear el rol.' });
    }
  }
}));

rolesRouter.get('/', [jwtAuthenticate], procesarErrores(async (_req: Request, res: Response) => {
  try {
    const roles = await roleController.all();
    res.json({ data: roles });
  } catch (error) {
    // Handle the error
    res.status(500).json({ message: 'Error al obtener todos los roles.' });
  }
}));

rolesRouter.get('/:id',[jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const role = await roleController.find(id);
    if (!role) {
      throw new RoleNotExist(`rol con id [${id}] no existe.`);
    }
    res.json(role);
  } catch (error) {
    // Manejar el error
    if (error instanceof RoleNotExist) {
      res.status(405).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al obtener el rol.' });
    }  
  }
}));

rolesRouter.put('/:id',[jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

   try {
    let roleToUpdate = await roleController.find(id);
    if (!roleToUpdate) {
      throw new RoleNotExist(`El rol con id [${id}] no existe.`);
    }
    const roleUpdated = await roleController.edit(id, req.body);
    if(roleUpdated){
      res.json({ message: `El rol con nombre [${roleUpdated.name}] ha sido modificado con éxito.`, data: roleUpdated });
      log.info(`El rol con id [${roleUpdated.id}] ha sido modificado con éxito.`);
    }

  } catch (error) {
    // Manejar el error
    if (error instanceof RoleNotExist) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al modificar el rol.' });
    }  
  }
}));

rolesRouter.delete('/:id',[jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    let roleToDelete = await roleController.find(id);
    if (!roleToDelete) {
      throw new RoleNotExist(`El rol con id [${id}] no existe.`);
    }
    roleToDelete = await roleController.destroy(id, roleToDelete);
    log.info(`rol con id [${id}] fue eliminado.`);
    res.json({ message: `rol con nombre [${roleToDelete.name}] fue eliminado.`, data: roleToDelete });
  } catch (error) {
    // Manejar el error
    if (error instanceof RoleNotExist) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar el rol.' });
    }  
  }
}));


// Create endpoint for assigning permissions to a role
rolesRouter.post('/:id/permissions', [jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  const permissionIds: number[] = req.body.permissionIds;

  try {
    const role = await roleController.createRolePermission(permissionIds, roleId);
    res.json({ message: `Permissions assigned to role with ID ${roleId}`, data: role });
  } catch (error) {
    // Handle the error
    res.status(500).json({ message: 'Error assigning permissions to role.' });
  }
}));

// Create endpoint for editing role permissions
rolesRouter.put('/:id/permissions', [jwtAuthenticate], procesarErrores(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  const permissionIds: number[] = req.body.permissionIds;

  try {
    const role = await roleController.editRolePermissions(permissionIds, roleId);
    res.json({ message: `Permissions updated for role with ID ${roleId}`, data: role });
  } catch (error) {
    // Handle the error
    res.status(500).json({ message: 'Error updating role permissions.' });
  }
}));

export default rolesRouter;
