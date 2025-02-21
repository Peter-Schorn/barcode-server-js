import "dotenv/config";
import app from "./app.js";
import { logger } from "./logging/loggers.js";
import { v4 as uuidv4 } from "uuid";
import { shutdownHandler } from "./utils/shutdownHandler.js";

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

process.on("SIGINT", (code) => {
    shutdownHandler(code);
});

process.on("SIGTERM", (code) => {
    shutdownHandler(code);
});

export { server, PROCESS_UUID };
