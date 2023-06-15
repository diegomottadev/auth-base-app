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

authRouter.post(
  '/login',
  [validLogin, convertBodyALowerCase as RequestHandler],
  procesarErrores(async (req: Request, res: Response) => {
    let userUnauthenticate = req.body;
    let userExisting;

    userExisting = await findByEmail(userUnauthenticate.email);

    if (!userExisting) {
      log.error(`Usuario[${userUnauthenticate.email}] no existe. No pudo ser autenticado`);
      throw new IncorrectCredentials('Credenciales incorrectas. Asegure que el email y contraseña sean correctas');
    }

    let passwordIsCorrect;


    console.log("[AUTH]", config.default.jwt.secreto)

    passwordIsCorrect = await bcrypt.compare(userUnauthenticate.password, userExisting.password);
    if (passwordIsCorrect) {
      let token = jwt.sign({ id: userExisting.id }, config.default.jwt.secreto, { expiresIn: '24h' });
      log.info(`Usuario ${userUnauthenticate.name} completo autenticacion exitosamente`);
      res.status(200).json({ token });
    } else {
      log.info(`Usuario ${userUnauthenticate.name} no completo autenticación. Contraseña incorrecta`);
      throw new IncorrectCredentials('Credenciales incorrectas. Asegure que el email y contraseña sean correctas');
    }
  })
);

authRouter.get('/me', async (req: Request, res: Response) => {
  
  try {
    if (!req.headers.authorization) {
      throw new Error('No authorization header');
    }

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken: any = jwt.verify(token, config.jwt.secreto);
    const user = await find(decodedToken.id);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'No autorizado' });
  }
});

export default authRouter;
