import winston from "winston";

const { align, cli, combine, printf, timestamp } = winston.format;
const transports = [];

transports.push(new winston.transports.Console({
    format: cli(),
    level: process.env.LOG_LEVEL_CONSOLE || "info",
}));

if (process.env.LOG_TO_LOGFILE === "true") {
    transports.push(new winston.transports.File({ 
        filename: "./logs/app.log",
        level: process.env.LOG_LEVEL_LOGFILE || "info",
        format: combine(
            timestamp(),
            align(),
            printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
        ),
    }));
}

const logger = winston.createLogger({
    transports,
});

export default logger;