import { Request, Response, NextFunction } from 'express';

export const procesarErrores = (fn: Function) => {
  return function(req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(next);
  };
};

export const erroresEnProduccion = (
  err: any,
  res: Response,
) => {
  res.status(err.status || 500);
  res.send({ message: err.message });
};

export const erroresEnDesarrollo = (
  err: any,
  res: Response,
) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    stack: err.stack || ''
  });
};
