import { z } from "zod";
import { uuidSchema } from "./uuid.js";
import { type Request } from "express";

/**
 * The schema for the request body of the `POST /scan/:username` endpoint.
 */
export const scanBarcodeRequestBody = z.object({
    barcode: z.string().nonempty(),
    id: uuidSchema.nullish()
});

/**
 * The type of request body of the `POST /scan/:username` endpoint.
 */
type ScanBarcodeRequestBody = z.infer<typeof scanBarcodeRequestBody>;

/**
 * The type of route parameters of the `POST /scan/:username` endpoint.
 */
type ScanBarcodeRequestParams = {
    username: string;
};

/**
 * The type of the query of the `POST /scan/:username` endpoint.
 */
type ScanBarcodeRequestQuery = {
    barcode?: string;
    id?: string;
};

/**
 * The type of the request object for the `POST /scan/:username` endpoint.
 */
export interface ScanBarcodeRequest extends Request {
    body: ScanBarcodeRequestBody;
    params: ScanBarcodeRequestParams;
    query: ScanBarcodeRequestQuery;
}
