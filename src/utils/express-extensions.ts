
import express from "express";

express.request.routeName = function(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const route = this.route?.path ?? this.url;
    return `${this.method} ${route}`;
};

express.request.getFirstQueryParamValue = function(
    key: string
): string | undefined {

    const value = this.query[key];

    if (Array.isArray(value)) {
        return value[0] as (string | undefined);
    }

    return value as (string | undefined);

};
