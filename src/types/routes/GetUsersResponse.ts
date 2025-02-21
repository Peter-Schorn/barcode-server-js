import { type Response } from "express";
import { type Send } from "express-serve-static-core";

/**
 * The response type of the `GET /users` endpoint.
 */
export interface GetUsersResponse extends Response {
    json: Send<string[], this>;
}
