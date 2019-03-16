class Console @ "xs_console_destructor" {
  static log() @ "xs_console_log"
  static debug() {
    trace(args);
  }

  constructor() {
  }
}
Object.freeze(Console.prototype);

global.console = Console;

