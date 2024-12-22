/**
 * Represents the SQL `DEFAULT` keyword.
 * This can be used to indicate that a column should use its default value.
 */
export const SQLDefault = {
    rawType: true,
    toPostgres: (): string => "DEFAULT"
};
