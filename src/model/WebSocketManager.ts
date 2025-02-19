import { WebSocketClient } from "./WebSocketClient.js";
import { logger } from "../logging/loggers.js";
import { errorToDebugString } from "../utils/errors.js";
import { db } from "../database/connection.js";

class WebSocketManager {

    private clients: Map<string, WebSocketClient>;

    constructor() {
        this.clients = new Map();
    }

    addClient(client: WebSocketClient): void {

        this.clients.set(client.id, client);

        const clientCount = this.clients.size;

        logger.debug(
            `WebSocketManager: added socket for user '${client.username}' ` +
            `(id: ${client.id}); total sockets: ${clientCount}`
        );

        db.none(
            "INSERT INTO websocket_connections (id, username) " +
            "VALUES (${id}, ${username})",
            {
                id: client.id,
                username: client.username
            }
        )
        .catch((error) => {
            logger.error(
                "WebSocketManager: error adding socket for user " +
                `'${client.username}' (id: ${client.id}) to database: ` +
                `${errorToDebugString(error)}`
            );
        });


        client.websocket.on("message", (message) => {

            const messageString = Buffer.isBuffer(message) ?
                message.toString() :
                JSON.stringify(message);

            logger.debug(
                `WebSocketManager: socket for user '${client.username}' ` +
                `(id: ${client.id}) message: ${messageString}`
            );
            if (messageString === "ping") {
                client.websocket.send("pong");
            }
        });

        client.websocket.on("ping", (data) => {
            logger.debug(
                `WebSocketManager: socket for user '${client.username}' ` +
                `(id: ${client.id}) ping: ${data.toString()}`
            );
        });

        client.websocket.on("pong", (data) => {
            logger.debug(
                `WebSocketManager: socket for user '${client.username}' ` +
                `(id: ${client.id}) pong: ${data.toString()}`
            );
        });

        client.websocket.on("close", (code, reason) => {
            logger.debug(
                `WebSocketManager: socket for user '${client.username}' ` +
                `(id: ${client.id}) closed: code: ${code}, ` +
                `reason: ${reason.toString()}`
            );
            this.removeClient(client);

            db.none(
                "DELETE FROM websocket_connections WHERE id = ${id}",
                { id: client.id }
            )
            .catch((error) => {
                logger.error(
                    "WebSocketManager: error removing socket for user " +
                    `'${client.username}' (id: ${client.id}) from database: ` +
                    `${errorToDebugString(error)}`
                );
            });

        });

        client.websocket.on("error", (error) => {
            const errorString = errorToDebugString(error);
            logger.error(
                `WebSocketManager: socket for user '${client.username}' ` +
                `(id: ${client.id}) error: ${errorString}`
            );
            // Shouldn't need to remove the client here, right?

        });


    }

    removeClient(client: WebSocketClient): void {
        client.websocket.close();
        this.clients.delete(client.id);
    }

    getClient(id: string): WebSocketClient | undefined {
        return this.clients.get(id);
    }

    /**
     * Gets all clients for a given user.
     *
     * @param username the username of the user to get clients for
     * @returns an array of WebSocketClient objects for the given user
     */
    getAllClientsForUser(username: string): WebSocketClient[] {
        const clients = [];
        for (const client of this.clients.values()) {
            if (client.username === username) {
                clients.push(client);
            }
        }
        return clients;
    }

    /**
     *  Sends a JSON message to all clients for a given user.
     *
     * @param username the username of the user to send the message to
     * @param data the data to send to the user, which will be serialized to
     * JSON
     */
    sendJSONToUser(username: string, data: any): void {

        logger.debug(`WebSocketManager: sending JSON to user '${username}'`);

        const clients = this.getAllClientsForUser(username);

        for (const client of clients) {
            if (client.websocket.readyState === WebSocket.OPEN) {
                client.sendJSON(data);
            }
        }

    }

}

export const webSocketManager = new WebSocketManager();
