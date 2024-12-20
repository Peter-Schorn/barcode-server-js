import { z } from "zod";
import { isValidUUIDv4 } from "../utils/uuid.js";

/**
 * Represents a v4 UUID.
 */
export const uuidSchema = z.string().refine(value => isValidUUIDv4(value), {
    message: "invalid v4 uuid",
});
