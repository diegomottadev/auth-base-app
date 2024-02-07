import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

/*

  This code defines a blueprint or schema for validating role data. 

*/

const blueprintRol = Joi.object({
  name: Joi.string().required(),
  description: Joi.any(),
});

export const validationRole = (req: Request, res: Response, next: NextFunction) => {
  const resultado = blueprintRol.validate(req.body, { abortEarly: false, convert: false });
  if (resultado.error === undefined) {
    next();
  } else {
    let errorDeValidacion = resultado.error.details.map(error => {
      return `[${error.message}]`;
    });
    log.warn(`The role data did not pass validation: : ${JSON.stringify(req.body)} - ${errorDeValidacion}`);
    res.status(400).send(`${errorDeValidacion}`);
  }
};


