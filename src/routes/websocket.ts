import { Router } from "websocket-express";
import { logger } from "../logging/loggers.js";
import { WebSocketClient } from "../model/WebSocketClient.js";
import { webSocketManager } from "../model/WebSocketManager.js";

// mounted at /watch
const wsRouter = new Router();


// MARK: WebSocket /watch/:username
//
// Accepts a WebSocket connection for a user with the given username.
// Sends messages to the client about new scans and scans that have been
// deleted.
wsRouter.ws("/:username", async (req, res, next) => {
    try {

        const routeName = "/watch/:username";

        const username = req.params.username!;
        logger.debug(`${routeName}: username: ${username}`);

        const webSocket = await res.accept();

        logger.debug(
            `${routeName}: accepted WebSocket connection for user ${username}`
        );

        const webSocketClient = new WebSocketClient(username, webSocket);
        webSocketManager.addClient(webSocketClient);

    } catch (error) {
        next(error);
    }
});

export default wsRouter;
