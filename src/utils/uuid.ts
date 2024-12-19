import { version as uuidVersion } from "uuid";
import { validate as uuidValidate } from "uuid";

/**
 * Checks if the given string is a valid version 4 UUID.
 *
 * @param {string} uuid - The string to be checked.
 * @returns {boolean} - Returns true if the string is a valid UUID v4, otherwise
 * false.
 */
export function isValidUUIDv4(uuid: string): boolean {
    // https://www.npmjs.com/package/uuid?activeTab=readme#uuidvalidatestr
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}
