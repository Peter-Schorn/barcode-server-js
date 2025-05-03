import { z } from "zod";
import { uuidSchema } from "./uuid.js";
import { type Request } from "express";

/**
 * The schema for the request body of the `POST /scan/:username` endpoint.
 */
export const scanBarcodeRequestBody = z.object({
    /** barcode is the canonical name for the field */
    barcode: z.string().nonempty().nullish(),
    /** text is an alias for the barcode field */
    text: z.string().nonempty().nullish(),
    id: uuidSchema.nullish()
})
.superRefine((data, ctx) => {

    if (!data.barcode && !data.text) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "missing required field 'barcode' or 'text'",
        });
    }
    else if (data.barcode && data.text) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Exactly one of 'barcode' or 'text' must be provided as " +
                "a non-empty string",
        });
    }

})
.transform(data => {
    // we already checked that exactly one of barcode or text is set
    // so we can safely use the non-null assertion operator
    const barcode = (data.barcode ?? data.text)!;
    return {
        barcode,
        id: data.id
    };
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
