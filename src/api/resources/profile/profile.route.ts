import express, { Request, Response } from 'express';
import passport from 'passport';
import log from '../utils/logger';
import * as profileController from './profile.controller';
import { procesarErrores } from '../../libs/errorHandler';
import  { checkUserRolePermission } from './../helpers/checkRolePermision.helper';
import { User } from '../../../models/user.model';
import { ProfileNotExist, ProfileParameterNotSpecify } from './profile.error';
import { saveImage } from './../../data/image.controller';
import validarImagenDeProducto from './profile.validate';
import * as https from 'https';

const jwtAuthenticate = passport.authenticate('jwt', { session: false });

const profileRouter = express.Router();


function generateRandomNumber(): string {
  const extensionLength = 10;
  const min = 10 ** (extensionLength - 1);
  const max = (10 ** extensionLength) - 1;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

 
// Get a specific role by ID
profileRouter.get('/', [jwtAuthenticate,checkUserRolePermission('Read')], procesarErrores(async (req: Request, res: Response) => {
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
  

  profileRouter.put('/photo', [jwtAuthenticate, checkUserRolePermission('Update'), validarImagenDeProducto], procesarErrores(async (req: Request, res: Response) => {
    const user = req.user as User
    const user_id = user?.id;

      let profileToUpdate = await profileController.me(user_id);
      if (!profileToUpdate) {
        throw new ProfileNotExist(`User with ID [${user_id}] does not exist.`);
      }

      const nameRandom = `${generateRandomNumber()}.${req.extensionDeArchivo}`
      await saveImage(req.body,nameRandom)
      const urlImage = `https://app-base-auth-aws.s3.us-east-2.amazonaws.com/images/${nameRandom}`
      const profileUpdated = await profileController.saveUrlImageProfile(user_id,urlImage)
      res.status(200).json(profileUpdated)
    
  }));

profileRouter.get('/photo', [jwtAuthenticate, checkUserRolePermission('Read')], procesarErrores(async (req: Request, res: Response) => {
  const user = req.user as User;
  const user_id = user?.id;

  try {
    const profile = await profileController.me(user_id);
    if (!profile) {
      throw new ProfileNotExist();
    }

    // Read the image file
    const imagePath = profile.urlImageProfile; // Replace with the actual path to the image file
    if (imagePath) {
      https.get(imagePath, (response) => {
        let data = Buffer.alloc(0);
      
        response.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
      
        response.on('end', () => {
          // Set the appropriate content type for the response
          res.contentType('image/jpeg');
          res.send(data);
        });
      
        response.on('error', (error) => {
          console.error('Error reading image:', error);
          res.status(500).json({ message: 'Error reading image.' });
        });
      });
    }  
  } catch (error) {
    // Handle the error
    if (error instanceof ProfileNotExist) {
      console.warn(`User profile for the user with ID [${user_id}] does not exist: ${error.message}`);
      res.status(405).json({ message: error.message });
    } else if (error instanceof ProfileParameterNotSpecify) {
      console.warn(`User with ID [${user_id}] did not specify a parameter: ${error.message}`);
      res.status(405).json({ message: error.message });
    } else {
      console.error(`Error getting the user profile with ID [${user_id}]:`, error);
      res.status(500).json({ message: 'Error getting the user profile.' });
    }
  }
}));


  export default profileRouter;
