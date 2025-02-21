import { type Response } from "express";
import { type Send } from "express-serve-static-core";
import {
    type ScannedBarcodesResponse
} from "../../model/ScannedBarcodesResponse.js";

/**
 * The response type of the `GET /scans` and `GET /scans/:username` endpoints.
 */
export interface GetScansResponse extends Response {
    json: Send<ScannedBarcodesResponse, this>;
}
