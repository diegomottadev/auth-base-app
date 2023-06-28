import express, { Request, Response } from 'express';
import passport from 'passport';
import log from '../utils/logger';
import * as profileController from './profile.controller';
import { procesarErrores } from '../../libs/errorHandler';
import  { checkUserRolePermission } from './../helpers/checkRolePermision.helper';
import { User } from '../../../models/user.model';
import { ProfileNotExist, ProfileParameterNotSpecify } from './profile.error';

const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const profileRouter = express.Router();

// Get a specific role by ID
profileRouter.get('/me', [jwtAuthenticate,checkUserRolePermission('Read')], procesarErrores(async (req: Request, res: Response) => {
    const user = req.user as User
    const user_id = user?.id;
    try {
      const profile = await profileController.me(user_id);
      if (!profile) {
        throw new ProfileNotExist();
      }
      res.json(profile);
    } catch (error) {
      // Handle the error
      if (error instanceof ProfileNotExist) {
        log.warn( `User profile for the user with ID [${user_id}] does not works: ${error.message}`);
        res.status(405).json({ message: error.message });
      }
      else if (error instanceof ProfileParameterNotSpecify) {
          log.warn( `User with ID [${user_id}] does not specify a parameter: ${error.message}`);
          res.status(405).json({ message: error.message });
      } else {
        log.error(`Error getting the user profile with ID [${user_id}]`);
        res.status(500).json({ message: 'Error getting the user profile.' });
      }
    }
    
  }));

  profileRouter.put('/', [jwtAuthenticate, checkUserRolePermission('Update')], procesarErrores(async (req: Request, res: Response) => {
    const user = req.user as User
    const user_id = user?.id;
  
    try {
      let profileToUpdate = await profileController.me(user_id);
      if (!profileToUpdate) {
        throw new ProfileNotExist(`User with ID [${user_id}] does not exist.`);
      }
      const profileUpdated = await profileController.edit(user_id, req.body);
      if (profileUpdated) {
        log.info(`User profile with ID [${profileUpdated.id}] has been successfully updated.`);
        res.json({ message: `User profile with name [${profileUpdated.name}] has been successfully updated.`, data: profileUpdated });
      }
    } catch (error) {

      if (error instanceof ProfileNotExist) {
        log.warn(`User with ID [${user_id}] not found :${error.message}`);
        res.status(404).json({ message: error.message });
      } else {
        log.error(`Error updating user profile with user ID [${user_id}].`);
        res.status(500).json({ message: 'Error updating user profile.' });
      }
    }
  }));
  

  export default profileRouter;
