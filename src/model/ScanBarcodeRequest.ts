import { z } from "zod";
import { uuidSchema } from "./uuid.js";
import { type Request } from "express";

export const scanBarcodeRequestBody = z.object({
    barcode: z.string().nonempty(),
    id: uuidSchema.nullish()
});

export type ScanBarcodeRequestBody = z.infer<typeof scanBarcodeRequestBody>;

export interface ScanBarcodeRequest extends Request {
    body: ScanBarcodeRequestBody;
}
