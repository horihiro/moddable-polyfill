debugger;

import {} from 'fetch';

Promise.resolve().then(() => {
  return fetch('http://httpbin.org/get');
  // return fetch('https://translate.google.com');
})
.then((r) => {
  trace(`${r.url}\n`);
  trace(`${r.status} ${r.statusText} ${r.redirected}\n`);
  trace(`${JSON.stringify(r.headers)}\n`);
  trace(`${JSON.stringify(r.ok)}\n`);

  return r.ok ? r.json() : r.statusText;
})
.then((t) => {
  trace(`${JSON.stringify(t, null, 2)}\n`)
})
.catch(e => {
  trace(e)
});
