export {};

declare global {
    namespace Express {
        export interface Request {
            /**
             * Returns the name of the route that is processing the request in
             * the format "{method} {path}".
             */
            routeName(): string;

            /**
             * Returns the first value of the query parameter with the specified
             * key.
             *
             * If a query string contains duplicate keys, then express will
             * return an array of values for that key. This method returns the
             * first value.
             *
             * @param key The key of the query parameter to get the value of.
             *
             * @returns The first value of the query parameter with the
             * specified key, or `undefined` if the query parameter does not
             * exist.
             */
            getFirstQueryParamValue(key: string): string | undefined;
        }
    }
}
