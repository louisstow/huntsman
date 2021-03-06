"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAgentMiddleware = void 0;
const Middleware_1 = require("../Middleware");
const topAgents = [
    "Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1",
];
class UserAgentMiddleware extends Middleware_1.Middleware {
    constructor(strategy = "random", agentList) {
        super();
        this.index = 0;
        if (!global.HUNTSMAN_SETTINGS.UA_STICKY_CACHE) {
            global.HUNTSMAN_SETTINGS.UA_STICKY_CACHE = {};
        }
        this.strategy = strategy;
        if (agentList) {
            this.agentList = agentList;
        }
        else {
            this.agentList = topAgents;
        }
    }
    randomPick() {
        return this.agentList[(this.agentList.length * Math.random()) | 0];
    }
    pick(r) {
        if (this.strategy === "sticky") {
            const cache = global.HUNTSMAN_SETTINGS.UA_STICKY_CACHE;
            if (cache[r.url]) {
                return cache[r.url];
            }
            else {
                const ua = this.randomPick();
                cache[r.url] = ua;
                return ua;
            }
        }
        else if (this.strategy === "rotate") {
            return this.agentList[this.index++];
        }
        return this.randomPick();
    }
    processRequest(r) {
        if (r) {
            r.setHeader("User-Agent", this.pick(r));
        }
        return Promise.resolve(r);
    }
}
exports.UserAgentMiddleware = UserAgentMiddleware;
