import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

const MIME_TYPE_VALIDOS = ['image/jpeg', 'image/jpg', 'image/png'];

// Extend the Request type to include the custom property 'extensionDeArchivo'
declare module 'express' {
  interface Request {
    extensionDeArchivo?: string;
  }
}

async function validarImagenDeProducto(req: Request, res: Response, next: NextFunction) {

  let contentType = req.get('content-type') as string;
  if (!MIME_TYPE_VALIDOS.includes(contentType)) {
    log.warn(`Request to modify product image with id [${req.params.id}] has an invalid content-type [${contentType}]`);
    res.status(400).send(`Files of type ${contentType} are not supported. Please use one of ${MIME_TYPE_VALIDOS.join(", ")}`);
    return;
  }

  try {
    // You can add more validation logic here if needed

    // Add the file extension to the request based on the content-type
    req.extensionDeArchivo = getExtensionFromContentType(contentType);
    next();
  } catch (error) {
    log.error(`Error while validating image: ${error}`);
    res.status(500).send('Internal Server Error');
  }
}

function getExtensionFromContentType(contentType: string): string | undefined {
  if (contentType === 'image/jpeg') {
    return 'jpg';
  } else if (contentType === 'image/jpg') {
    return 'jpg';
  } else if (contentType === 'image/png') {
    return 'png';
  }
  return undefined;
}

export default validarImagenDeProducto;
