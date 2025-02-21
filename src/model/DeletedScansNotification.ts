export type DeletedScan = {
    id: string;
    username: string;
};

/**
 * Represents the payload of the notification sent to the client when scans are
 * deleted from the database.
 */
export type DeletedScans = DeletedScan[];
