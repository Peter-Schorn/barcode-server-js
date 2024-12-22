import { z } from "zod";
import { uuidSchema } from "./uuid.js";

/**
 * Represents the body of the request for the DELETE /scans endpoint, which
 * deletes scanned barcodes by id and/or user from the database.
 */
// TODO: Because these parameters can also be supplied as query parameters,
// TODO: which allows the body to be empty, should this entire object be
// TODO: optional?
export const deleteScansRequestBody = z.object({
    ids: z.array(uuidSchema).nullish(),
    users: (z.array(z.string())).nullish()
})
.refine(data => data.ids?.length || data.users?.length, {
    message: "Either 'ids' or 'users' must be provided as a non-empty array",
    path: ["ids", "users"]
});


export type DeleteScansRequestBody = z.infer<typeof deleteScansRequestBody>;
