"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryMiddleware = void 0;
const Middleware_1 = require("../Middleware");
const Queue_1 = require("../Queue");
class RetryMiddleware extends Middleware_1.Middleware {
    constructor(numTimes, retryStatusCodes) {
        super();
        this.numTimes = 5;
        this.retryStatusCodes = [
            500,
            502,
            503,
            504,
            522,
            524,
            408,
            429,
            400,
            403,
        ];
        this.attempts = {};
        if (numTimes) {
            this.numTimes = numTimes;
        }
        if (retryStatusCodes) {
            this.retryStatusCodes = retryStatusCodes;
        }
    }
    processResponse(item) {
        const req = item.request;
        const resp = req.response;
        if ((resp && this.retryStatusCodes.includes(resp.status)) || req.error) {
            // keep track of attempts
            if (!this.attempts[item.request.url]) {
                this.attempts[item.request.url] = 0;
            }
            else if (this.attempts[item.request.url] >= this.numTimes) {
                return Promise.resolve(true);
            }
            item.state = Queue_1.QueueItemState.READY;
            this.attempts[item.request.url]++;
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }
}
exports.RetryMiddleware = RetryMiddleware;
