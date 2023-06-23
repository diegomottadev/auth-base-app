import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import logger from './api/resources/utils/logger';
import authJTW from './api/libs/auth';
import config from './api/config';
import passport from 'passport';
import {procesarErrores,erroresEnProduccion,erroresEnDesarrollo} from './api/libs/errorHandler';
import {connectionDB} from "./connection/connection"

import cors from 'cors';
import usersRouter from './api/resources/users/users.route';
import authRouter from './api/resources/auth/auth.route';
import rolesRouter from './api/resources/roles/roles.route';
import permissionsRouter from './api/resources/permissions/permissions.route';
import profileRouter from './api/resources/profile/profile.route';
import { initializeDatabase } from './helpers/initializeDatabase';

const app = express(); // Create an instance of the Express application

app.use(cors()); // Enable Cross-Origin Resource Sharing

app.use(
  morgan('short', {
    stream: {
      write: (message) => logger.info(message.trim()) // Configure Morgan to log HTTP requests using the 'short' format and send log messages to the logger
    }
  })
);

passport.use(authJTW); // Configure Passport to use the authJTW strategy for authentication

app.use(bodyParser.json()); // Parse incoming request bodies in JSON format and make the data available on req.body

app.use(passport.initialize()); // Initialize Passport middleware

// Connect to the database


connectionDB().then((databaseExists:boolean) => {
  // Only run the initialization script if the database exists
  if (databaseExists) {
    initializeDatabase();
  } else {
    console.log('Database does not exist. Skipping initialization script.');
  }
});

app.use('/auth', authRouter); // Route requests for authentication-related endpoints to the authRouter
app.use('/users', usersRouter); // Route requests for user-related endpoints to the usersRouter
app.use('/roles', rolesRouter); // Route requests for role-related endpoints to the rolesRouter
app.use('/permissions', permissionsRouter); // Route requests for permission-related endpoints to the permissionsRouter
app.use('/profile', profileRouter); // Route requests for permission-related endpoints to the permissionsRouter

app.use(procesarErrores); // Custom error handling middleware

if (config.ambiente === 'prod') {
  app.use(erroresEnProduccion); // Error handling middleware for production environment
} else {
  app.use(erroresEnDesarrollo); // Error handling middleware for development environment
}

app.listen(3000, () => console.log('listening...survey!!!')); // Start the server and listen on port 3000
