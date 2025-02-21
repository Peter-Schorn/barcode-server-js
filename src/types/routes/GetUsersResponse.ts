import { type Response } from "express";

/**
 * The response type of the `GET /users` endpoint.
 */
export type GetUsersResponse = Response<string[]>;
