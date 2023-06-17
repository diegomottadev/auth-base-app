import log from './../resources/utils/logger';
import passportJWT from 'passport-jwt';
import config from '../config/index';
import * as userController from '../resources/users/users.controller';

// Configure JWT authentication strategy
const jwtOption: passportJWT.StrategyOptions = {
    // Specify the secret key used to sign and verify JWT tokens
    secretOrKey: config.default.jwt.secreto,
    // Extract the JWT token from the request header's "Authorization" field
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  };
  
  // Define the JWT authentication strategy
  const jwtStrategy = new passportJWT.Strategy(jwtOption, (jwtPayload, next) => {
    // Find the user associated with the provided JWT payload's ID
    userController.find(jwtPayload.id)
      .then(user => {
        if (!user) {
          // If no user is found, log an info message and indicate authentication failure
          log.info(`JWT token is not valid. User with ID ${jwtPayload.id} does not exist`);
          next(null, false);
          return;
        }
        // If a user is found, log an info message and indicate successful authentication
        log.info(`User ${user.name} provided a valid token. Authentication completed`);
        // Call the "next" function with the user's name and ID to indicate successful authentication
        next(null, {
          name: user.name,
          id: user.id,
        });
      })
      .catch(err => {
        // If an error occurs during the process, log an error message and pass the error to the "next" function
        log.error("An error occurred while validating the token", err);
        next(err);
      });
  });
  

export default jwtStrategy;
