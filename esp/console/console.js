class Console @ "xs_console_destructor" {
  static log() @ "xs_console_log"

  constructor() {
  }
}
Object.freeze(Console.prototype);

global.console = Console;

