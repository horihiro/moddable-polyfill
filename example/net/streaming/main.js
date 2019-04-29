debugger;

import {} from 'fetch';

const buffer2String = (buf) => {
  return String.fromCharCode.apply("", new Uint8Array(buf))
}

const largeBuffer2String = (buf) => {
  const tmp = [];
  const len = 128;
  for (var p = 0; p < buf.byteLength; p += len) {
    tmp.push(buffer2String(buf.slice(p, p + len)));
  }
  return tmp.join("");
}

Promise.resolve().then(() => {
  return fetch('https://translate.google.com');
})
.then((res) => {
  const total = res.headers.get('content-length');
  trace(`content-length: ${total || -1}\n`)

  // Getting reader of body
  let body = res.body;
  let reader = body.getReader();
  let chunk = 0;
  let tkk = null;
  // returning Promise object which resolve chunks by calling read() 
  return reader.read().then(function processResult(result) {
    // done が true なら最後の chunk
    const str = largeBuffer2String(result.value);
    // trace(`${str}\n`);
    if (!tkk) {
      tkk = str.match(/(?:tkk:|TKK=)'(\d+.\d+)'/);
      if (tkk) {
        tkk = tkk[1];
        trace(`${new Date()}: ${tkk}\n`);
      }
    }

    if (result.done) {
      return tkk;
    }

    // chunk の値

    // 再帰する
    return reader.read().then(processResult);
  });
})
.then((result) => {
  trace(`${new Date()}: done\n`);
})
.catch(e => {
  trace(e)
})
.then(() => {
  fetchStreaming();    
});
