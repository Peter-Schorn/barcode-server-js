
/**
 * Type guard to check if an error is a Node.js system error.
 *
 * This function checks if the given error is an instance of the built-in
 * Error class and if it has a `code` property, which is typical for Node.js
 * system errors.
 *
 * @param error The error to check.
 * @returns True if the error is a Node.js system error, otherwise false.
 */
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error;
}


/**
 * Converts an error to a string that can be used for debugging purposes,
 * such as logging.
 *
 * @param error The error to convert.
 * @returns A string representation of the error.
 */
export function errorToDebugString(error: unknown): string {

    if (!(error instanceof Error)) {
        return JSON.stringify(error);
    }

    const errorDetails: { [key: string]: unknown }  = {};

    const name = error.name;
    if (name) {
        errorDetails.name = name;
    }

    const message = error.message;
    if (message) {
        errorDetails.message = message;
    }

    const cause = error.cause;
    if (cause) {
        errorDetails.cause = cause;
    }

    const propertyNames = Object.getOwnPropertyNames(error)
        .filter((propertyName) => propertyName !== "stack");


    for (const propertyName of propertyNames) {
        errorDetails[propertyName] = (error as any)[propertyName];
    }

    return JSON.stringify(errorDetails);

}
