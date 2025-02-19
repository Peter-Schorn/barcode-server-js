import "dotenv/config";
import app from "./app.js";
import { logger } from "./logging/loggers.js";
import { db, pgp } from "./database/connection.js";
import { v4 as uuidv4 } from "uuid";

// MARK: process UUID
// Used to identify this process so that, if multiple instances of the server
// are running, only websocket connections from this process are deleted when
// the server is shut down.
const PROCESS_UUID = uuidv4();

const port = process.env.PORT ?? 8080;

const server = app.listen(port, () => {

    console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL}`);

    const env = process.env.NODE_ENV ?? "development";
    if (env === "development") {
        logger.notice(`Server running on http://localhost:${port}`);
    }
    else {
        logger.notice(`Server running on port ${port}`);
    }

});

function shutdownHandler(signal: NodeJS.Signals): void {
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

process.on("SIGINT", (code) => {
    shutdownHandler(code);
});

process.on("SIGTERM", (code) => {
    shutdownHandler(code);
});

export { PROCESS_UUID };
