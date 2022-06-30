interface IService {
  tick: number;
  /* tslint:disable:ban-types */
  callback: Function;
}
export default class Service {
  private registerService: IService[];
  constructor() {
    this.registerService = this.register();
  }
  public register = () => {
    return [];
  };
  run() {
    this.registerService.forEach((element) => {
      const interval = setInterval(() => {
        element.callback(interval);
      }, element.tick);
    });
  }
}
