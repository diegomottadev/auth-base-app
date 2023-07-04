import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import FileTypeStream from 'file-type-stream';

const MIME_TYPE_VALIDOS = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Extend the Request type to include the custom property 'extensionDeArchivo'.
 */
declare module 'express' {
  interface Request {
    extensionDeArchivo?: string;
  }
}

/**
 * Middleware function to validate product image.
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
function validarImagenDeProducto(req: Request, res: Response, next: NextFunction) {
  let contentType = req.get('content-type') as string;
  if (!MIME_TYPE_VALIDOS.includes(contentType)) {
    log.warn(`Request to modify product image with id [${req.params.id}] has invalid content-type [${contentType}]`);
    res.status(400).send(`Files of type ${contentType} are not supported. Please use one of ${MIME_TYPE_VALIDOS.join(", ")}`);
    return;
  }

  const fileTypeStream = new FileTypeStream();

  fileTypeStream.on('file-type', (fileType) => {
    if (!fileType || !MIME_TYPE_VALIDOS.includes(fileType.mime)) {
      const mensaje = `Mismatch between content-type [${contentType}] and file type [${fileType?.ext}]. Request will not be processed`;
      log.warn(`${mensaje}. Request targeted to product with id [${req.params.id}] from user [${req.user?.username}]`);
      res.status(400).send(mensaje);
      return;
    }

    // Add the file extension to the request so that it can be used when saving the image
    req.extensionDeArchivo = fileType.ext;
    next();
  });

  req.pipe(fileTypeStream);
}

export default validarImagenDeProducto;
