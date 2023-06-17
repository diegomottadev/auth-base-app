import { Request, Response, NextFunction } from 'express';

/*

procesarErrores is a middleware function used to handle errors in asynchronous functions. 
It takes a function fn as a parameter and returns a new function that wraps the original function.
The returned function handles any errors that occur during the execution of fn by catching them and passing them
to the next function, which triggers the error-handling middleware.
This allows for consistent error handling in asynchronous routes or middleware.

*/

export const procesarErrores = (fn: Function) => {
  return function(req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(next);
  };
};

/*

The Middleware erroresEnProduccion is a function to handle errors in production environments. 
It sets the response status code based on the error status or defaults to 500 (Internal Server Error). 
It sends a JSON response with the error message.

*/

export const erroresEnProduccion = (
  err: any,
  res: Response,
) => {
  res.status(err.status || 500);
  res.send({ message: err.message });
};

/*

The Middleware erroresEnDesarrollo is a function to handle errors in development environments. 
It sets the response status code based on the error status or defaults to 500 (Internal Server Error). 
It sends a JSON response with the error message and the error stack trace, if available.


*/

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
