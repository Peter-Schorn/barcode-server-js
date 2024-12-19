export { };

declare global {
    namespace Express {
        export interface Request {
            /**
             * Returns the name of the route that the request is being processed by
             * in the format "{method} {path}".
             */
            routeName(): string;

            myProp: number;
        }
    }
}
