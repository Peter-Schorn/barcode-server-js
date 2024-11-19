import mongoose from "mongoose";

const connectionURI = process.env.BARCODE_DROP_DATABASE_CONNECTION_URI;
if (!connectionURI) {
    throw new Error(
        "could not retrieve connection URI from " +
        "BARCODE_DROP_DATABASE_CONNECTION_URI environment variable"
    );
}

try {
    await mongoose.connect(connectionURI);
    console.log("connected to database");
} catch (error) {
    console.error("could not connect to database");
    // "If it is necessary to terminate the Node.js process due to an error 
    // condition, throwing an uncaught error and allowing the process to terminate 
    // accordingly is safer than calling process.exit()." - Node.js documentation
    // https://nodejs.org/api/process.html#process_process_exit_code
    //
    // Therefore, we throw the error and allow it to remain uncaught.
    throw error;
}
