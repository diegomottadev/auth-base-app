import Joi from '@hapi/joi';
import log from '../utils/logger';


/*

This code defines a blueprint or schema for validating login data. 
The blueprintLogin object specifies the required structure and constraints for the login data, 
such as the password and email fields.

*/

const blueprintLogin = Joi.object({
  password: Joi.string().min(4).max(200).required(),
  email: Joi.string().required(),
});

const validLogin = (req: any, res: any, next: any) => {
  const result = blueprintLogin.validate(req.body, { abortEarly: false, convert: false });
  if (result.error === undefined) {
    next();
  } else {
    const validationErrors = result.error.details.map((error: any) => {
      return `[${error.message}]`;
    });
    log.warn('The user data did not pass validation: ', req.body, validationErrors);
    res.status(400).send(validationErrors);
  }
};


export { validLogin };
