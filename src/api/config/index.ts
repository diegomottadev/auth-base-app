const ambiente: string = process.env.NODE_ENV || 'development';

const configuracionBase: any = {
  jwt: {},
  puerto: 3000
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
