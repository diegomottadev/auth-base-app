import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

const blueprintRol = Joi.object({
  name: Joi.string().required(),
});

export const validationRole = (req: Request, res: Response, next: NextFunction) => {
  const resultado = blueprintRol.validate(req.body, { abortEarly: false, convert: false });
  if (resultado.error === undefined) {
    next();
  } else {
    let errorDeValidacion = resultado.error.details.map(error => {
      return `[${error.message}]`;
    });
    log.warn(`El rol no pasó la validación: ${JSON.stringify(req.body)} - ${errorDeValidacion}`);
    res.status(400).send(`${errorDeValidacion}`);
  }
};


