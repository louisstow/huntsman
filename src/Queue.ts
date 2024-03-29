import { Request, RequestState } from "./Request";
import { Response } from "./Response";

enum QueueItemState {
  READY,
  IN_USE,
  FINISHED,
}

class QueueItem {
  request: Request;
  index: number;
  state: QueueItemState;

  constructor(request: Request, index: number) {
    this.request = request;
    this.index = index;
    this.state = QueueItemState.READY;
  }

  setFinished() {
    this.state = QueueItemState.FINISHED;
  }

  setReady() {
    this.state = QueueItemState.READY;
  }

  setInUse() {
    this.state = QueueItemState.IN_USE;
  }
}

class Queue {
  queue: Array<QueueItem>;

  constructor(queue?: Array<Request>) {
    this.queue = [];
    if (queue) {
      queue.forEach((r) => this.enqueue(r));
    }
  }

  enqueue(req: Request) {
    const index = this.queue.length;
    const item = new QueueItem(req, index);
    this.queue.push(item);
  }

  reserveFirstReadyItem(): QueueItem | null {
    const item = this.queue.find((item) => item.state === QueueItemState.READY);

    if (!item) {
      return null;
    }

    item.state = QueueItemState.IN_USE;
    return item;
  }

  buffer(n: number) {
    const b: QueueItem[] = [];

    while (n--) {
      const item = this.reserveFirstReadyItem();
      if (!item) {
        break;
      }

      b.push(item);
    }

    return b;
  }

  size(): number {
    return this.queue.length;
  }

  countInUse(): number {
    return this.queue.filter((item) => item.state === QueueItemState.IN_USE)
      .length;
  }

  countRemainingItems(): number {
    return this.queue.filter((item) => item.state !== QueueItemState.FINISHED)
      .length;
  }

  countFinishedItems(): number {
    return this.queue.filter((item) => item.state === QueueItemState.FINISHED)
      .length;
  }

  forEach(fn: (value: QueueItem, index: number) => void) {
    this.queue.forEach(fn);
  }

  quickDebug() {
    return this.queue
      .map((item) => {
        if (item.state === QueueItemState.FINISHED) {
          return "finished";
        } else if (item.state === QueueItemState.IN_USE) {
          return "in use";
        } else if (item.state === QueueItemState.READY) {
          return "ready";
        } else {
          return "unknown";
        }
      })
      .join(", ");
  }

  getDebugState() {
    const logs: string[] = [];
    this.forEach((item, i) => {
      logs.push(
        `${i}\t${QueueItemState[item.state]}\t${item.request.url.substr(
          0,
          220
        )}`
      );
    });

    return logs.join("\n");
  }

  serialize(): object[] {
    return this.queue.map((item) => ({
      index: item.index,
      request: item.request.serialize(),
    }));
  }

  static deserialize(obj: object[]) {
    const items = obj
      .map((o: any) => {
        let req, resp;

        if (o.request) {
          req = new Request(o.request.url, o.request.method, o.request.data);
          if (o.request.headers) {
            req.headers = o.request.headers;
          }

          if (o.request.meta) {
            req.meta = o.request.meta;
          }

          if (o.request.responseType) {
            req.responseType = o.request.responseType;
          }

          if (o.request.response) {
            const respData = o.request.response;
            if (req.responseType === "arraybuffer") {
              respData.raw = Buffer.from(respData.raw);
            }

            resp = new Response(
              req,
              respData.url,
              respData.status,
              respData.statusText,
              respData.headers,
              null,
              respData.raw
            );

            req.response = resp;
          }

          return new QueueItem(req, o.index);
        }

        return null;
      })
      .filter((item) => item !== null) as QueueItem[];

    const q = new Queue();
    q.queue = items;
    return q;
  }

  static empty() {
    return new Queue([]);
  }
}

export { Queue, QueueItem, QueueItemState };
