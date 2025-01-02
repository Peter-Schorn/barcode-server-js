import { type IConnected, type ILostContext } from "pg-promise";
import { type Notification } from "pg";
import db from "./connection.js";
import { pgp } from "./connection.js";
import { logger } from "../logging/loggers.js";
import { errorToDebugString } from "../utils/errors.js";
import { webSocketManager } from "../model/WebSocketManager.js";
import {
    type ScannedBarcodesResponse,
    type ScannedBarcodeResponse
} from "../model/ScannedBarcodesResponse.js";
import { 
    type DeletedScansNotification
} from "../model/DeletedScansNotification.js";

// MARK: Documentation
// https://github.com/vitaly-t/pg-promise/wiki/Robust-Listeners

// MARK: Listen for database notifications

class IClient extends pgp.pg.Client { }

/** the channel to listen on */
const channel = "barcodes";

/** global connection for permanent event listeners */
let connection: IConnected<object, IClient> | null;

/**
 * Handles the notification from the database.
 */
function onNotification(notification: Notification): void {

    logger.debug(`Listener: Received Payload ${notification.payload}`);
    
    if (!notification.payload) {
        logger.error("Listener: Payload is empty");
        return;
    }

    try {
        const json = JSON.parse(notification.payload);

        switch (json.type) {
            case "insert": {
                /*
                [
                    {
                        "id": "b95c3d50-5b25-4c50-84d7-052c5c7e8c8a",
                        "scanned_at": "2025-01-01T21:42:10.554407-06:00",
                        "barcode": "a",
                        "username": "peter"
                    },
                    {
                        "id": "7b2ad348-37b7-4d57-be21-83895acf91fe",
                        "scanned_at": "2025-01-01T21:42:10.554407-06:00",
                        "barcode": "b",
                        "username": "nicholas"
                    },
                    {
                        "id": "d055c4c7-35c9-4fe9-b36e-c05da9258735",
                        "scanned_at": "2025-01-01T21:42:10.554407-06:00",
                        "barcode": "c",
                        "username": "april"
                    }
                ]
                */
                const data = json.data as ScannedBarcodesResponse;

                /*
                [
                    "peter": [
                        {
                            "id": "b95c3d50-5b25-4c50-84d7-052c5c7e8c8a",
                            "scanned_at": "2025-01-01T21:42:10.554407-06:00",
                            "barcode": "a",
                            "username": "peter"
                        }
                    ],
                    "nicholas": [
                        {
                            "id": "7b2ad348-37b7-4d57-be21-83895acf91fe",
                            "scanned_at": "2025-01-01T21:42:10.554407-06:00",
                            "barcode": "b",
                            "username": "nicholas"
                        }
                    ],
                    "april": [
                        {
                            "id": "d055c4c7-35c9-4fe9-b36e-c05da9258735",
                            "scanned_at": "2025-01-01T21:42:10.554407-06:00",
                            "barcode": "c",
                            "username": "april"
                        }
                    ]
                ]
                */
                const grouped = Object.groupBy(
                    data, (scan: ScannedBarcodeResponse): string => {
                        return scan.username;
                    }
                );

                for (const [username, scans] of Object.entries(grouped)) {
                    const payload = {
                        type: "upsertScans",
                        newScans: scans
                    };
                    webSocketManager.sendJSONToUser(username, payload);
                }
                break;
            }
            case "delete": {
                /*
                [
                    {
                        "id": "32510738-b792-4045-b460-69879b43b920",
                        "username": "peter"
                    },
                    {
                        "id": "118ec805-8636-4446-95dc-bcdf65473e00",
                        "username": "peter"
                    },
                    {
                        "id": "98a7343d-22eb-431f-ae66-9de797c6be85",
                        "username": "nicholas"
                    }
                ]
                */
                const data = json.data as DeletedScansNotification;
                
                /*
                [
                    "peter": [
                        "32510738-b792-4045-b460-69879b43b920", 
                        "118ec805-8636-4446-95dc-bcdf65473e00"
                    ],
                    "nicholas": [
                        "98a7343d-22eb-431f-ae66-9de797c6be85"
                    ]
                ]
                */
                const userDeletedIds = new Map<string, string[]>();
                for (const scan of data) {
                    if (!userDeletedIds.has(scan.username)) {
                        userDeletedIds.set(scan.username, []);
                    }
                    userDeletedIds.get(scan.username)!.push(scan.id);
                }

                for (const [username, ids] of userDeletedIds) {
                    const payload = {
                        type: "deleteScans",
                        ids: ids
                    };
                    webSocketManager.sendJSONToUser(username, payload);
                }

                break;
            }
            default: {
                logger.error(
                    `Listener: Unknown payload type: ${json.type}`
                );
            }
        }

    } catch (error) {
        logger.error(
            "Listener: Error parsing JSON payload: " +
            `${errorToDebugString(error)}`
        );
    }



}

function setupListeners(client: IClient): Promise<void | null> {

    client.on("notification", onNotification);
    return connection!.none("LISTEN ${channel:name}", { channel })
        .catch(error => {
            // unlikely to ever happen
            logger.error(
                "Listener: error configuring listener " +
                `${errorToDebugString(error)}`
            );
        });
}

function removeListeners(client: IClient): void {
    client.removeListener("notification", onNotification);
}

function onConnectionLost(err: Error, e: ILostContext<IClient>): void {
    logger.error(`Listener: Connectivity Problem: ${errorToDebugString(err)}`);
    connection = null; // prevent use of the broken connection
    removeListeners(e.client);
    reconnect(5_000, 10) // retry 10 times, with 5-second intervals
        .then(() => {
            logger.debug("Listener: Successfully Reconnected");
        })
        .catch((error) => {
            // failed after 10 attempts
            logger.crit(
                "Listener: Connection Lost Permanently: " +
                `${errorToDebugString(error)}`
            );
        });
}

function reconnect(
    delay: number = 0,
    maxAttempts: number = 1
): Promise<IConnected<object, IClient>> {
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
                        "Listener: Error Reconnecting: " +
                        `${errorToDebugString(error)}`
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

try {
    await reconnect();
    logger.debug("Listener: Successful Initial Connection");

} catch (error) {
    logger.error(
        `Listener: Failed Initial Connection: ${errorToDebugString(error)}`
    );
}
