import "dotenv/config";
import app from "./app.js";
import logger from "./logging/logger.js";
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL}`);
    const env = process.env.NODE_ENV ?? "development";
    if (env === "development") {
        logger.notice(`Server running on http://localhost:${port}`);
    }
    else {
        logger.notice(`Server running on port ${port}`);
    }
});