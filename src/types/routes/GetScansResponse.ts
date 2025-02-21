import { type Response } from "express";
import {
    type ScannedBarcodesResponse
} from "../../model/ScannedBarcodesResponse.js";

/**
 * The response type of the `GET /scans` and `GET /scans/:username` endpoints.
 */
export type GetScansResponse = Response<ScannedBarcodesResponse>;
