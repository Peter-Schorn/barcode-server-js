import winston from "winston";
import { type Format } from "logform";

// syslog log levels:
// {
//     emerg: 0,
//     alert: 1,
//     crit: 2,
//     error: 3,
//     warning: 4,
//     notice: 5,
//     info: 6,
//     debug: 7
//   }

/** aws cloudwatch logs do not support terminal colors */
const colorizeFormatIfDev: Format[] =
    process.env.NODE_ENV === "production"
        ? []
        : [winston.format.colorize()];

const logLevel = process.env.LOG_LEVEL ?? "info";

/**
 * The logger used for general logging.
 */
export const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    level: logLevel,
    format: winston.format.combine(
        ...colorizeFormatIfDev,
        winston.format.simple(),
    ),
    transports: [
        new winston.transports.Console()
    ],
});

/**
 * The logger used for logging SQL queries.
 */
export const sqlLogger = winston.createLogger({
    levels: winston.config.syslog.levels,
    level: logLevel,
    format: winston.format.combine(
        ...colorizeFormatIfDev,
        winston.format.label({ label: "SQL" }),
        winston.format.printf(info => {
            return `[${info.label}] ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ],
});
