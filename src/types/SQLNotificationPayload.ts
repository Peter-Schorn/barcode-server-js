import {
    type ScannedBarcodesResponse,
} from "../model/ScannedBarcodesResponse.js";

import {
    type DeletedScans
} from "../model/DeletedScansNotification.js";

import {
    SQLNotificationTypes
} from "../model/SQLNotificationTypes.js";

export type InsertedScansNotificationPayload = {
    type: SQLNotificationTypes.Insert;
    data: ScannedBarcodesResponse;
};

export type DeletedScansNotificationPayload = {
    type: SQLNotificationTypes.Delete;
    data: DeletedScans;
};

export type SQLNotificationPayload =
    | InsertedScansNotificationPayload
    | DeletedScansNotificationPayload;
