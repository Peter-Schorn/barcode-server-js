import pgPromise from "pg-promise";
const connectionURI = process.env.BARCODE_DROP_DATABASE_CONNECTION_URI;
if (!connectionURI) {
    throw new Error("could not get database connection URI from " +
        "BARCODE_DROP_DATABASE_CONNECTION_URI environment variable");
}
const pgp = pgPromise({
/* Initialization Options */
});
const db = pgp(connectionURI);
export default db;
