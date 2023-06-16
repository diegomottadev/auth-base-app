import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import logger from './api/resources/utils/logger';
import authJTW from './api/libs/auth';
import config from './api/config';
import passport from 'passport';
import {procesarErrores,erroresEnProduccion,erroresEnDesarrollo} from './api/libs/errorHandler';
import connectionDB from "./connection/connection"

import cors from 'cors';
import usersRouter from './api/resources/users/users.route';
import authRouter from './api/resources/auth/auth.route';
import rolesRouter from './api/resources/roles/roles.route';
import permissionsRouter from './api/resources/permissions/permissions.route';

const app = express();

app.use(cors());
app.use(
  morgan('short', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

passport.use(authJTW);

app.use(bodyParser.json());

app.use(passport.initialize());

//-conexion
connectionDB()


app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/permissions', permissionsRouter);


app.use(procesarErrores);

if (config.ambiente === 'prod') {
  app.use(erroresEnProduccion);
} else {
  app.use(erroresEnDesarrollo);
}

app.listen(3000, () => console.log('listening...survey!!!'));