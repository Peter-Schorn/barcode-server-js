import { type Request, type Response, type NextFunction } from "express";
import { logger } from "../logging/loggers.js";
import { errorToDebugString } from "../utils/errors.js";

/**
 * A middleware that logs errors using the logger.
 * 
 */
export function logErrorsMiddleware(
    err: any, req: Request, res: Response, next: NextFunction
): void {

    const routeName = req.routeName();
    const errorString = errorToDebugString(err);

    logger.error(`${routeName}: ${errorString}`);

    next(err);

}
