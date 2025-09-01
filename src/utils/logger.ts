import { greenBright } from 'ansis';
import { consola, type ConsolaInstance, type LogType } from 'consola';

class Logger {
  private readonly _logger: ConsolaInstance;

  prefix: string;

  constructor(prefix = greenBright('[unplugin-react-router]')) {
    this._logger = consola;
    this.prefix = prefix;
  }

  log(msg: string, type: LogType, show = true) {
    if (!show) return;

    this._logger[type](`${this.prefix} ${msg}`);
  }

  start(msg: string, show = true) {
    this.log(msg, 'start', show);
  }

  info(msg: string, show = true) {
    this.log(msg, 'info', show);
  }

  success(msg: string, show = true) {
    this.log(msg, 'success', show);
  }

  warn(msg: string, show = true) {
    this.log(msg, 'warn', show);
  }

  error(msg: string, show = true) {
    this.log(msg, 'error', show);
  }

  table(data: any[], show = true) {
    if (!show) return;

    // eslint-disable-next-line no-console
    console.table(data);
  }
}

export const logger: Logger = new Logger();
