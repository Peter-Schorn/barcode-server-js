import { 
    // type IDatabase,
    type IConnected, 
    type ILostContext
} from "pg-promise";
// import { type IClient } from "pg-promise/typescript/pg-subset.js";
// import { type IClient } from "pg-promise";
// import { type Client as IClient } from "pg";
import { type Notification } from "pg";

import db from "./connection.js";
import { logger } from "../logging/loggers.js";
import { errorToDebugString } from "../utils/errors.js";

// MARK: Documentation
// https://github.com/vitaly-t/pg-promise/wiki/Robust-Listeners

// MARK: Listen for database notifications

// type IClient = IDatabase<Client>;
type IClient = any;

/** the channel to listen on */
const channel = "barcodes";

/** global connection for permanent event listeners */
let connection: IConnected<any, IClient> | null;

/**
 * Handles the notification from the database.
 */
function onNotification(notification: Notification): void {
    
    logger.debug(`onNotification: Received Payload ${notification.payload}`);
    
    const json = notification.payload ? JSON.parse(notification.payload) : null;
    
}

function setupListeners(client: IClient): Promise<void | null> {
    client.on("notification", onNotification);
    return connection!.none("LISTEN ${channel:name}", {channel})
        .catch(error => {
            logger.error(error); // unlikely to ever happen
        });
}

function removeListeners(client: IClient): void {
    client.removeListener("notification", onNotification);
}

function onConnectionLost(err: Error, e: ILostContext<IClient>): void {
    logger.error(`Connectivity Problem:, ${errorToDebugString(err)}`);
    connection = null; // prevent use of the broken connection
    removeListeners(e.client);
    reconnect(5_000, 10) // retry 10 times, with 5-second intervals
        .then(() => {
            logger.debug("Successfully Reconnected");
        })
        .catch(() => {
            // failed after 10 attempts
            logger.crit("Connection Lost Permanently");
        });
}

function reconnect(
    delay: number = 0, 
    maxAttempts: number = 1
): Promise<IConnected<any, IClient>> {
    return new Promise((resolve, reject) => {

        setTimeout(() => {
            db.connect({ direct: true, onLost: onConnectionLost })
                .then(obj => {
                    connection = obj; // global connection is now available
                    resolve(obj);
                    return setupListeners(obj.client);
                })
                .catch(error => {
                    logger.error(
                        `Error Reconnecting: ${errorToDebugString(error)}`
                    );
                    if (--maxAttempts) {
                        reconnect(delay, maxAttempts)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                        reject(error);
                    }
                });
        }, delay);

    });
}

reconnect()
    .then(() => {
        logger.debug("Listener: Successful Initial Connection");
        // releases the connection
        // obj.done();
    })
    .catch(error => {
        logger.debug(
            `Listener: Failed Initial Connection: ${errorToDebugString(error)}`
        );
    });
