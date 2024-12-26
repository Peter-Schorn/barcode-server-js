export {};

declare global {
    interface Date {
        /**
         * Returns a new `Date` object that is the specified number of seconds
         * before this `Date` object.
         *
         * @param seconds The number of seconds to subtract from this `Date`
         * object.
         *
         * @returns A new `Date` object that is the specified number of seconds
         * before this `Date` object.
         */
        subtractingSeconds(seconds: number): Date;
    }
}
