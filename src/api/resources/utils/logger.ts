import winston from 'winston';

const incluirFecha = winston.format((info: any) => {
    info.message = `${new Date().toISOString()} ${info.message}`;
    return info;
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize({ message: true }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            level: 'info',
            handleExceptions: true,
            format: winston.format.combine(
                incluirFecha(),
                winston.format.simple(),
            ),
            maxsize: 5120000, // 5 MB
            maxFiles: 5,
            filename: `${__dirname}/../_logs/logs-de-aplicacion.log`
        })
    ]
});

export default logger;
