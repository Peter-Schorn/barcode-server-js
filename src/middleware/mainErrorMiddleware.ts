import { type Request, type Response, type NextFunction } from "express";
import { DatabaseError } from "pg-protocol";

export function mainErrorMiddleware(
    err: any, req: Request, res: Response, next: NextFunction
): void {

    if (err instanceof DatabaseError) {
        if (
            err.code === "23505" &&
            err.constraint === "barcodes_pkey"
        ) {
            res.contentType("text/plain");
            res.status(400).send(
                "a barcode with this id already exists"
            );
            return;
        }
    }

    // Handle body parse errors
    if (err instanceof SyntaxError) {
        res.contentType("text/plain");
        res.status(400).send(err.message);
        return;
    }

    next(err);

}
