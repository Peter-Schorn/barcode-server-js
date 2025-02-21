import "dotenv/config";
import { logger } from "../logging/loggers.js";
import { db, pgp } from "../database/connection.js";
import { PROCESS_UUID } from "../index.js";
import { server } from "../index.js";

export function shutdownHandler(signal: NodeJS.Signals): void {
    logger.notice(`Received signal ${signal}. Cleaning up...`);

    new Promise<void>((resolve) => {
        server.close((error) => {

            logger.notice("Server closed");

            if (error) {
                logger.error(
                    `Error closing server: ${error}`
                );
            }
            // We want to resolve the promise regardless of whether there was an
            // error because we want to continue with the cleanup process. If we
            // reject with an error, then subsequent .then blocks will not be
            // executed.
            resolve();
        });
    })
    .then(() => {
        return db.none(
            "DELETE FROM websocket_connections WHERE " +
            "process_uuid = ${process_uuid}",
            { process_uuid: PROCESS_UUID }
        );
    })
    .then(() => {
        logger.notice("Deleted websocket connections from database");
    })
    .catch((error) => {
        logger.error(
            `Error deleting websocket connections from database: ${error}`
        );
    })
    .finally(() => {

        pgp.end();  // close all database connection pools

        logger.notice("Exiting...");
        process.exit(0);
    });

}
