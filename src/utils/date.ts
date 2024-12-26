Date.prototype.subtractingSeconds = function(seconds: number): Date {
    return new Date(this.getTime() - seconds * 1_000);
};
