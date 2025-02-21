import { type Request } from "express";

/**
 * The type of route parameters of the `DELETE /scans/:username` endpoint.
 */
type DeleteUserScansRequestParams = {
    username: string;
};

export interface DeleteUserScansRequest extends Request {
    params: DeleteUserScansRequestParams;
}
