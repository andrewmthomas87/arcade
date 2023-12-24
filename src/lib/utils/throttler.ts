export class Throttler {
  public rps: number;
  public prevTime: number | null = null;

  constructor(rps: number) {
    this.rps = rps;
  }

  getWaitTime() {
    if (this.prevTime === null) {
      return 0;
    }

    const timeSincePrev = Date.now() - this.prevTime;
    const waitTime = Math.max(1000 / this.rps - timeSincePrev, 0);

    return waitTime;
  }

  async run<T>(fn: (...args: any) => T | Promise<T>) {
    const waitTime = this.getWaitTime();
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const r = await fn();

    this.prevTime = Date.now();

    return r;
  }
}
