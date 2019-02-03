#include "xsAll.h"
#include "xs.h"

void xs_console_destructor(void)
{
}

void xs_console_log(xsMachine *the)
{
  int argc = xsToInteger(xsArgc), i;

  for (i = 0; i < argc; i++) {
    char *str = xsToString(xsArg(i));

    do {
      uint8_t c = c_read8(str);
      if (!c) {
        ESP_putc('\n');
        break;
      }

      ESP_putc(c);

      str++;
    } while (1);
  }
}
