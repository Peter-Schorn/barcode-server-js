import express from "express";

express.request.routeName = function() {
    return `${this.method} ${this.route.path}`;
};
