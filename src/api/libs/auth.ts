import log from './../resources/utils/logger';
import passportJWT from 'passport-jwt';
import config from '../config/index';
import * as userController from '../resources/users/users.controller';

// Módulo de autenticación con JWT
// Ve a buscar el token en el header del request
const jwtOption: passportJWT.StrategyOptions = {
    secretOrKey: config.default.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtStrategy = new passportJWT.Strategy(jwtOption, (jwtPayload, next) => {
    userController.find(jwtPayload.id)
        .then(usuario => {
            if (!usuario) {
                log.info(`JWT token no es válido. Usuario con el id ${jwtPayload.id} no existe`);
                next(null, false);
                return;
            }
            log.info(`Usuario ${usuario.name} suministró un token válido. Autenticación completada`);
            next(null, {
                name: usuario.name,
                id: usuario.id,
            });
        })
        .catch(err => {
            log.error("Ocurrió un error al tratar de validar el token", err);
            next(err);
        });
});

export default jwtStrategy;
