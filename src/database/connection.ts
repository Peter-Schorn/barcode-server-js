import pgPromise from "pg-promise";
import { sqlLogger } from "../logging/loggers.js";

const connectionURI = process.env.BARCODE_DROP_DATABASE_CONNECTION_URI;
if (!connectionURI) {
    throw new Error(
        "could not get database connection URI from " +
        "BARCODE_DROP_DATABASE_CONNECTION_URI environment variable"
    );
}

const pgp = pgPromise({
    // called when a query is executed
    query(e) {
        sqlLogger.debug(e.query);
    }
});

const db = pgp(connectionURI);

export default db;
