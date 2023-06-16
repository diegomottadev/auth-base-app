import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

const blueprintUser = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).max(100).required(),
  roleId: Joi.number().required(),
 // firstName: Joi.string().required(),
 // lastName: Joi.string().required(),
 // phoneNumber: Joi.string().required()
});

export const validationUser = (req: Request, res: Response, next: NextFunction) => {
  const resultado = blueprintUser.validate(req.body, { abortEarly: false, convert: false });
  if (resultado.error === undefined) {
    next();
  } else {
    let errorDeValidacion = resultado.error.details.map(error => {
      return `[${error.message}]`;
    });
    log.warn(`El siguiente usuario no pasó la validación: ${JSON.stringify(req.body)} - ${errorDeValidacion}`);
    res.status(400).send(`${errorDeValidacion}`);
  }
};


