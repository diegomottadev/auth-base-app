import Joi from '@hapi/joi';
import log from '../utils/logger';

const blueprintLogin = Joi.object({
  password: Joi.string().min(5).max(200).required(),
  email: Joi.string().required(),
});

const validLogin = (req: any, res: any, next: any) => {
  const result = blueprintLogin.validate(req.body, { abortEarly: false, convert: false });
  if (result.error === undefined) {
    next();
  } else {
    const errorDeValidacion = result.error.details.map((error: any) => {
      return `[${error.message}]`;
    });
    log.warn('Los datos del usuario no pasaron la validación: ', req.body, errorDeValidacion);
    res.status(400).send(errorDeValidacion);
  }
};

export { validLogin };
