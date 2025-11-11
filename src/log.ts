import type { IPlayerLog } from './web/models/models';

export class Log implements IPlayerLog {
  logEnabled = false;

  constructor(logEnabled = false) {
    this.logEnabled = logEnabled;
  }

  public log(msg: string, ...supportingDetails: any[]): void {
    this.emitLogMessage('log', msg, supportingDetails);
  }

  public debug(msg: string, ...supportingDetails: any[]): void {
    this.emitLogMessage('debug', msg, supportingDetails);
  }

  public warn(msg: string, ...supportingDetails: any[]): void {
    this.emitLogMessage('warn', msg, supportingDetails);
  }

  public error(msg: string, ...supportingDetails: any[]): void {
    this.emitLogMessage('error', msg, supportingDetails);
  }

  public info(msg: string, ...supportingDetails: any[]): void {
    this.emitLogMessage('info', msg, supportingDetails);
  }

  private emitLogMessage(msgType: 'log' | 'debug' | 'warn' | 'error' | 'info', msg: string, supportingDetails: any[]) {
    if (this.logEnabled) {
      supportingDetails.length > 0
        ? console[msgType]('[Youtube Player Plugin Web]: ' + msg, supportingDetails)
        : console[msgType]('[Youtube Player Plugin Web]: ' + msg);
    }
  }
}
