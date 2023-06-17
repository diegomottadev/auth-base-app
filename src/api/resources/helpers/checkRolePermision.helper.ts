import { Request, Response, NextFunction } from 'express';
import * as userController from './../users/users.controller';
import { User } from '../../../models/user.model';

/*

This function checkUserRolePermission defines a middleware function checkUserRolePermission that checks if the authenticated 
user has a specific role and permission. 
It takes a permission parameter and returns a middleware function to be used in Express routes

*/

export const checkUserRolePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      // Get the authenticated user ID from the JWT payload
      const authenticatedUserId = req.user ? (req.user as User).id : null;

      if (!authenticatedUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if the authenticated user has the necessary role and permission
      const hasPermission = await userController.checkUserRolePermission(authenticatedUserId, permission);

      if (!hasPermission) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // User has the necessary role and permission, continue to the next middleware
      next();
    } catch (error) {
      // Handle the error
      res.status(500).json({ message: "Internal server error" });
    }

    // Add the following return statement
    return ; //depending on your intention
  };
};
