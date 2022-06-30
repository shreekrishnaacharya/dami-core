export default class Console {
  private static logBackup = console.log;
  static log(arg: any) {
    const logMessages = [];
    logMessages.push.apply(logMessages, arg);
    this.logBackup.apply(console, arg);
    return logMessages;
  }
}
