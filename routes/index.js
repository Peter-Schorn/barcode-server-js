import express from "express";
import db from "../database/connection.js";
import logger from "../logging.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("success");
});

router.get("/test", async (req, res) => {

    try {
        const result = await db.any("SELECT * FROM barcodes");
        logger.info(`result: ${JSON.stringify(result)}`);
    }
    catch (error) {
        logger.error(`error: ${error}`);
    }

    res.send("test");

});

export default router;
