import express from "express";
import db from "../database/connection.js";
import { logger } from "../logging/loggers.js";
import { isValidUUIDv4 } from "../utils/uuid.js";
import { SQLDefault } from "../database/types.js";
import { logErrorsMiddleware } from "../middleware/logErrorsMiddleware.js";
import { mainErrorMiddleware } from "../middleware/mainErrorMiddleware.js";
import { deleteScansRequestBody } from "../model/DeleteScansRequest.js";

const router = express.Router();

// MARK: GET /scans
//
// Retrieves all scanned barcodes from the database, sorted in descending order
// by "scanned_at" (the date they were scanned).
router.get("/scans", async (req, res) => {
    
    const routeName = req.routeName();

    const result = await db.any(
        "SELECT * FROM barcodes ORDER BY scanned_at DESC"
    );

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);

    res.send(result);

});

// MARK: Get /scans/<username>
//
// Retrieves all scanned barcodes for a specific user from the database, sorted
// in descending order by "scanned_at" (the date they were scanned).
router.get("/scans/:username", async (req, res) => {
    
    const routeName = req.routeName();

    const username: string = req.params.username;

    logger.debug(`${routeName}: username: "${username}"`);

    const result = await db.any(
        "SELECT * FROM barcodes WHERE username = ${username} " +
        "ORDER BY scanned_at DESC",
        { username }
    );

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);

    res.send(result);

});

// MARK: GET /users
//
// Retrieves all users from the database.
router.get("/users", async (req, res) => {
    
    const routeName = req.routeName();

    const result = await db.any(
        "SELECT DISTINCT username FROM barcodes"
    );

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);

    // Extract the username from each row in the result.
    const response = result.map((item) => {
        return item.username;
    });

    res.send(response);

});

// MARK: POST /scan/<username>
//
// Saves scanned barcode to the database.
//
// The barcode can be sent in the request body as JSON, URL encoded, or in the
// query string. If the barcode is present in the query string, then the entire
// body will be ignored.
//
// The barcode is saved to the database along with the user who scanned it and
// the date it was scanned.
//
// Path parameters:
// * username: The user who scanned the barcode.
//
// Body/query parameters:
// * barcode: The barcode that was scanned.
// * id: (optional) A unique identifier for the barcode represented by a version
//   4 UUID. If not provided, a UUID will be generated automatically.
//
// Examples:
// * JSON: { "barcode": "abc123", "id": "2dc9973d-a55b-4ddb-911e-99a886315c6e"}
// * URL Encoded: barcode=abc123&id=2dc9973d-a55b-4ddb-911e-99a886315c6e
// * Query String: ?barcode=abc123&id=2dc9973d-a55b-4ddb-911e-99a886315c6e
//
// Response: "user '<username>' scanned '<barcode>' (id: <id>)". A header with
// the name 'Barcode-ID' will be included in the response with the value of the
// barcode id.
router.post("/scan/:username", async (req, res) => {

    const routeName = req.routeName();

    const username: string = req.params.username;
    
    let barcode: string;
    let id: string | undefined | typeof SQLDefault;

    // parameters in query string
    if (req.query?.barcode) {
        barcode = req.query.barcode as string;
        id = req.query?.id as (string | undefined);
    }
    // parameters in body
    else if (req.body?.barcode) {
        barcode = req.body.barcode as string;
        id = req.body?.id as (string | undefined);
    }
    else {
        res.status(400).send("missing parameter 'barcode'");
        return;
    }

    logger.debug(
        `${routeName}: ` +
        `username: "${username}"; ` +
        `barcode: "${barcode}"; ` +
        `id: ${id};`
    );
    
    if (id) {
        if (!isValidUUIDv4(id)) {
            res.status(400).send("invalid v4 uuid");
            return;
        }
    }
    else {
        // The default value for the id column is a function that generates a
        // version 4 UUID. `DEFAULT gen_random_uuid()`.
        id = SQLDefault;
    }

    const result = await db.one(
        "INSERT INTO barcodes(id, barcode, username) " +
        "VALUES(${id}, ${barcode}, ${username}) RETURNING id",
        { id, barcode, username }
    );

    const insertedId: string = result.id;

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);
    
    res.header("Barcode-ID", insertedId);
    res.send(`user '${username}' scanned '${barcode}' (id: ${insertedId})`);

});

// MARK: DELETE /all-scans
//
// Deletes all scanned barcodes from the database.
router.delete("/all-scans", async (req, res) => {
    
    const routeName = req.routeName();

    const result = await db.result(
        "DELETE FROM barcodes"
    );

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);

    res.status(204).send();

});

// MARK: DELETE /scans/<username>
//
// Deletes all scanned barcodes for a specific user from the database.
router.delete("/scans/:username", async (req, res) => {
    
    const routeName = req.routeName();

    const username: string = req.params.username;

    logger.debug(`${routeName}: username: "${username}"`);

    const result = await db.result(
        "DELETE FROM barcodes WHERE username = ${username}",
        { username }
    );

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);

    res.status(204).send();

});

// MARK: DELETE /scans
//
// Deletes scanned barcodes by id and/or user from the database.
//
// If the query string contains `ids` and/or `users`, then the entire body will
// be ignored.
//
// Request body:
// { "ids": ["<id1>", "<id2>", ...], users: ["<user1>", "<user2>", ...]}
// where at least one of `ids` or `users` must be present.
// 
// Or, as URL query parameters: a comma separated list:
// ?ids=<id1>,<id2>...&users=<user1>,<user2>...
router.delete("/scans", async (req, res) => {
    
    const routeName = req.routeName();

    let ids: string[] = [];
    let users: string[] = [];

    // parameters in query string
    if (req.query?.ids || req.query?.users) {
        // TODO: Check if req.query.ids or req.query.ids are arrays,
        // TODO: which can happen if the query string contains multiple
        // TODO: instances of these keys
        ids = (req.query.ids as string)?.split(",");
        if (!ids.every(isValidUUIDv4)) {
            res.status(400).send("invalid v4 uuid");
            return;
        }
        users = (req.query.users as string)?.split(",");
    }
    // parameters in body
    else {
        const requestBody = deleteScansRequestBody.safeParse(req.body);
        if (requestBody.success) {
            ids = requestBody.data.ids ?? [];
            users = requestBody.data.users ?? [];
        }
        else {
            res.status(400).send(requestBody.error.errors);
            return;
        }
    }

    logger.debug(
        `${routeName}: ` +
        `ids: ${JSON.stringify(ids)}; ` +
        `users: ${JSON.stringify(users)};`
    );

    // TODO: SQL does not support an empty list in the IN clause, so if either
    // TODO: ids or users is an empty array, the query will fail.
    const result = await db.result(
        "DELETE FROM barcodes " +
        "WHERE id IN (${ids:list}) OR username IN (${users:list})",
        { ids, users }
    );

    logger.debug(`${routeName}: query result: ${JSON.stringify(result)}`);

    // TODO: Send information about the number of rows deleted?
    res.status(204).send();

});


router.use(logErrorsMiddleware);
router.use(mainErrorMiddleware);

export default router;
