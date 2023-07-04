import dotenv from 'dotenv';
dotenv.config()
const ambiente: string = process.env.NODE_ENV || 'development';

const configuracionBase: any = {
  jwt: {},
  puerto: 3000,
  s3: {
    accessKeyid :process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey :process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  }
};

let configuracionDeAmbiente: any = {};

switch (ambiente) {
  case 'desarrollo':
  case 'dev':
  case 'development':
    configuracionDeAmbiente = require('./dev');
    break;
  case 'produccion':
  case 'prod':
    configuracionDeAmbiente = require('./prod');
    break;
  default:
    configuracionDeAmbiente = require('./dev');
}

export default {
  ...configuracionBase,
  ...configuracionDeAmbiente
};
