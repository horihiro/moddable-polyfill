# moddable-polyfill
polyfill libraries for [Moddable SDK](https://github.com/Moddable-OpenSource/moddable)

## net
### WHATWG URL

**Note:** If you build it for esp8266, **update Moddable SDK to the latest**

manifest.json to use `URL`
```json
{
  "include": [
  ],
  "modules": {
    "*": [
      "path/to/URL",
    ]
  },
}

```

example.js
```js
import {URL} from 'URL';

const url = new URL('https://USER:PASS@example.com:9090/path/to/doc?se=keyword#hash');
trace(url.href);     // 'https://USER:PASS@example.com:9090/path/to/doc?se=keyword#hash'
trace(url.protocol); // 'https:'
trace(url.username); // 'USER'
trace(url.password); // 'PASS'
trace(url.origin);   // 'https://example.com:9090'
trace(url.host);     // 'example.com:9090'
trace(url.hostname); // 'example.com'
trace(url.port);     // '9090'
trace(url.pathname); // '/path/to/doc'
trace(url.search);   // '?se=keyword'
trace(url.hash);     // '#hash'
```

### Fetch API

manifest.json to use `fetch`
```json
{
  "include": [
    "$(MODDABLE)/examples/manifest_base.json",
    "$(MODDABLE)/examples/manifest_net.json",
    "$(MODDABLE)/modules/crypt/tls.json"
  ],
  "modules": {
    "*": [
      "path/to/fetch",
      "path/to/URL",
      "$(MODULES)/network/http/*"
    ]
  },
  "resources":{
    "*": [
      "$(MODULES)/crypt/data/ca109",
      "$(MODULES)/crypt/data/ca106",
    ]
  },
  "preload": [
    "http"
  ],
}
```

example.js
```js
import {} from 'fetch'; // import as global module.

fetch('https://example.com')
.then(r => r.json())   // if you want to get response as text, call r.text()
.then(j => trace(j))   // JSON
.catch(err => trace(err));
```

Note: You need to set SNTP server in order to set current time for date validation, if you want to access HTTPS site.
```sh
mcconfig -d -m -p esp sntp=pool.ntp.org ssid=foo password=bar
```

## Timer
### setInterval

manifest.json to use `setInterval`
```json
{
  "include": [
  ],
  "modules": {
    "*": [
      "path/to/setInterval",
    ]
  },
}

```

example.js
```js
import {} from 'setInterval';

let i = 0;
setInterval(() => {
  trace(`${i}\n`);
  i++;
}, 1000);

```

## Console
**Note:** This is only for esp32/8266. **It can't be built for Windows/macOS/Linux.**

TBD
