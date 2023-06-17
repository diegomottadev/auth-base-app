import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import {find, findByEmail }  from '../users/users.controller';
import { validLogin } from './auth.validate';
import { procesarErrores } from '../../libs/errorHandler';
import log from '../utils/logger';
import  {IncorrectCredentials}  from './auth.error';

const authRouter: Router = express.Router();

const convertBodyALowerCase = (req: Request, _res: Response, next: NextFunction) => {
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
};

/*

The '/login' route allows user authentication by checking if the provided email and password match an existing user in the system.
If the user exists and the password is correct, a JSON Web Token (JWT) is generated and returned as a response.
Otherwise, an error is thrown indicating incorrect credentials.
The function uses logging statements to log relevant information and error messages during the authentication process.

*/

authRouter.post('/login',[validLogin, convertBodyALowerCase as RequestHandler],
  procesarErrores(async (req: Request, res: Response) => {
    let userUnauthenticated = req.body;
    let userExisting;

    userExisting = await findByEmail(userUnauthenticated.email);

    if (!userExisting) {
      log.error(`User [${userUnauthenticated.email}] does not exist. Authentication failed`);
      throw new IncorrectCredentials('Incorrect credentials. Make sure the email and password are correct');
    }

    let passwordIsCorrect;

    console.log("[AUTH]", config.default.jwt.secreto);

    passwordIsCorrect = await bcrypt.compare(userUnauthenticated.password, userExisting.password);
    if (passwordIsCorrect) {
      let token = jwt.sign({ id: userExisting.id }, config.default.jwt.secreto, { expiresIn: '24h' });
      log.info(`User ${userUnauthenticated.name} successfully completed authentication`);
      res.status(200).json({ token });
    } else {
      log.error(`User ${userUnauthenticated.name} did not complete authentication. Incorrect password`);
      throw new IncorrectCredentials('Incorrect credentials. Make sure the email and password are correct');
    }
  })
);


/*

 The '/me' route, used to retrieve information about the currently authenticated user. 
 The function expects an authorization header with a JWT token. 
 It verifies the token's validity, extracts the user ID from the decoded token, and retrieves the corresponding user from the database.
 If the token is valid and the user is found, the user object is returned as a response. If the token is invalid or any error occurs during the process, an error message is logged, and a 401 Unauthorized response is sent. 
 The function uses logging statements to log relevant information and error messages during the authentication process.

*/

authRouter.get('/me', async (req: Request, res: Response) => {

  try {
    if (!req.headers.authorization) {
      throw new Error('No authorization header');
    }

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken: any = jwt.verify(token, config.jwt.secreto);
    const user = await find(decodedToken.id);
    log.info(`User successfully completed authentication. The entered token is correct for the user ${user?.name} with email ${user?.email}`);
    res.json({ user });
  } catch (err) {
    log.error(`User did not complete authentication. The entered token is incorrect`);
    res.status(401).json({ message: 'Unauthorized' });
  }
});


export default authRouter;
