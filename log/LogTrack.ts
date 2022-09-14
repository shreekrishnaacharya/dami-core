import * as process from 'process';

class LogTrack {
  private startTime: number;
  private logId: number;
  private queryList: any[];
  private maxTime: number;
  private maxMemory: number;
  private currentTime: number;
  private currentMemory: number;
  private countRequest: number;
  private isBreak: boolean;
  private averageMemory: number;
  private averageTime: number;
  constructor() {
    this.logId = null;
    this.queryList = [];
    this.maxTime = 0;
    this.maxMemory = 0;
    this.currentMemory = 0;
    this.currentTime = 0;
    this.countRequest = 0;
    this.isBreak = false;
    this.averageMemory = 0;
    this.averageTime = 0;
  }

  start = (req, res, next) => {
    // this.logId = Math.floor(Math.random() * 10000);
    // console.log("Start tracking request id : " + this.logId);
    // req.counter = Math.floor(Math.random() * 10000)
    const currentDate = new Date();
    req.startTime = currentDate.getTime();
    this.queryList = [];
    this.countRequest++;
    next();
  };
  queryLog = (query) => {
    this.queryList.push({ query });
  };
  getQuery = () => {
    console.log('============= Query Log =============');
    for (const ql of this.queryList) {
      console.log(ql.query);
    }
    console.log('\n');
  };
  memory = (req, res, next) => {
    // console.log("============= Memory Log =============");
    const used = process.memoryUsage();
    this.currentMemory = Math.round((used.rss / 1024 / 1024) * 100) / 100;
    if (this.maxMemory < this.currentMemory) {
      this.maxMemory = this.currentMemory;
      // console.log(`Max Mem ${this.maxMemory} MB`);
    }
    // console.log(`Max Mem ${this.maxMemory} MB`);
    // console.log(`rss ${mem} MB`);

    // for (let key in used) {
    //     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    // }
    // console.log("\n");
    next();
  };
  time = (req, res, next) => {
    const currentDate = new Date();
    const endTime = currentDate.getTime();
    this.currentTime = endTime - req.startTime;
    if (this.maxTime < this.currentTime) {
      this.maxTime = this.currentTime;
      // console.log("Highest Time : " + (this.maxTime));
    }
    // console.log("============= Time Log =============");
    // console.log("Start At : " + (this.startTime));
    // console.log("End At : " + (endTime));
    // console.log("Total Time : " + (endTime - this.startTime));

    // console.log("\n");
    next();
  };
  end = (req, res, next) => {
    if (this.isBreak) {
      return next();
    }
    if (this.maxTime > 1000) {
      this.isBreak = true;
    }
    this.averageMemory += this.currentMemory;
    this.averageTime += this.currentTime;
    const avgTime = Math.round(this.averageTime / this.countRequest);
    const avgMem = Math.round(this.averageMemory / this.countRequest);
    process.stdout.write(
      `COUNT: ${this.countRequest}\nMAX TIME: ${this.maxTime}\nTIME: ${this.currentTime}\nAVG TIME:${avgTime}\nMAX MEMORY: ${this.maxMemory}\nMEMORY: ${this.currentMemory}\nAVG MEMORY:${avgMem}\n`,
    );
    // console.log("End tracking request id : " + this.logId);
    this.logId = null;
    this.queryList = [];
    delete req.startTime;
    next();
  };
}

export default LogTrack;
