import { Middleware } from "../Middleware";
import { Request } from "../Request";

const topAgents = [
  "Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0",
  "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47",
];

class UserAgentMiddleware extends Middleware {
  strategy: string;
  agentList: string[];
  index: number = 0;
  stickyCache: { [key: string]: string } = {};

  constructor(strategy: string = "random", agentList?: string[]) {
    super();

    this.strategy = strategy;
    if (agentList) {
      this.agentList = agentList;
    } else {
      this.agentList = topAgents;
    }
  }

  randomPick(): string {
    return this.agentList[(this.agentList.length * Math.random()) | 0];
  }

  pick(r: Request): string {
    if (this.strategy === "sticky") {
      if (this.stickyCache[r.url]) {
        return this.stickyCache[r.url];
      } else {
        const ua = this.randomPick();
        this.stickyCache[r.url] = ua;

        return ua;
      }
    } else if (this.strategy === "rotate") {
      return this.agentList[this.index++];
    }

    return this.randomPick();
  }

  processRequest(r: Request | null): Promise<Request | null> {
    if (r) {
      r.setHeader("User-Agent", this.pick(r));
    }

    return Promise.resolve(r);
  }
}

export { UserAgentMiddleware };
