import {Request} from "http"
import SecureSocket from "securesocket";
import {URL} from 'URL';
import {} from 'setTimeout';
import config from 'mc/config';

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

class ReadableStreamDefaultReader {
  constructor(params) {
    this._bodyArray = [];
    this._request = params.request;

    this._count = 0;
  }

  closed() {
    return new Promise((response) => {
      this._request.close();
      response();
    });
  }

  read() {
    return new Promise((res) => {
      const checkBuffer = () => {
        setTimeout(() => {
          if (this._bodyArray.length < 1) {
            checkBuffer();
            return;
          }
          const done = !this._bodyArray[this._bodyArray.length - 1];
          if (done) this._bodyArray.pop();

          const length = this._bodyArray.reduce((prev, curr) => {
            return prev + curr.byteLength;
          }, 0);
          const whole = new Uint8Array(length);
          let pos = 0;
          this._bodyArray.forEach((buf) => {
            whole.set(new Uint8Array(buf), pos);
            pos += buf.byteLength;
          });
          for (let i=0;i<this._bodyArray.length;i++) {
            delete this._bodyArray[i];
          }
          delete this._bodyArray;
          this._bodyArray = [];
          res ({
            value: whole,
            done
          });
        }, 1);
      };
      checkBuffer();
    });
  }
}

class ReadableStream {
  constructor(params) {
    this._locked = false;
    this._readableStreamDefaultReader = params.readableStreamDefaultReader;
  }

  getReader() {
    this._locked = true;
    return this._readableStreamDefaultReader;
  }

  get locked() {
    return this._locked;
  }
}

class Headers {
  constructor() {
    this._headers = {};
  }

  set(name, value) {
    this._headers[name] = value;
  }

  get(name) {
    return this._headers[name.toLowerCase()];
  }
}

class Response {
  constructor(params) {
    this.params = params;
  }
  get headers() {
    return  this.params.headers;
  }

  get body() {
    return this.params.body;
  }

  get ok() {
    return 200 <= this.params.status && this.params.status < 300;
  }

  get status() {
    return this.params.status;
  }

  get statusText() {
    return this.params.statusText;
  }

  get redirected() {
    return this.params.redirected;
  }

  get type() {
    throw(new Exception('not implemented yet.'));
  }

  get url() {
    return this.params.href;
  }

  blob() {
    return new Promise((resolve, reject) => {
      reject('not implemented yet.');
    });
  }
  formData() {
    return new Promise((resolve, reject) => {
      reject('not implemented yet.');
    });
  }
  arrayBuffer() {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.params.body);
      } catch (e) {
        reject(e);
      }
    });
  }
  json() {
    return new Promise((resolve, reject) => {
      try {
        const buffer = this.params.body._readableStreamDefaultReader._bodyArray.filter(b => !!b);
        const length = buffer.reduce((prev, curr) => {
          return prev + curr.byteLength;
        }, 0);
        const whole = new Uint8Array(length);
        let pos = 0;
        buffer.forEach((buf) => {
          whole.set(new Uint8Array(buf), pos);
          pos += buf.byteLength;
        });
        resolve(JSON.parse(largeBuffer2String(whole)));
      } catch (e) {
        reject(e);
      }
    });
  }
  text() {
    return new Promise((resolve, reject) => {
      try {
        resolve(largeBuffer2String(this.params.body));
      } catch (e) {
        reject(e);
      }
    });
  }
}

const statusTextArray = {
  "100": "Continue",
  "101": "Switching Protocols",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Request Entity Too Large",
  "414": "Request-URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Requested Range Not Satisfiable",
  "417": "Expectation Failed",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
};

function fetch(href, options) {
  const url = new URL(href);
  const requestParams = {
    host: url.hostname,
    path: `${url.pathname}${url.search}${url.hash}`,
    // response: ArrayBuffer,
    port: parseInt(url.port) || 80,
  };
  if (options) {
    requestParams.method = options.method ? options.method.toUpperCase() : 'GET';
    requestParams.headers = [];
    options.headers && Object.keys(options.headers).forEach((key) => {
      requestParams.headers.push(key);
      requestParams.headers.push(options.headers[key]);
    })
    requestParams.body = options.body;
  }
  const redirect = ((opt) => {
    if (!opt || !opt.redirect) return 'follow';
    if (['follow', 'error', 'manual'].indexOf(opt.redirect) < 0) throw(new TypeError(`'redirect' member of RequestInit '${opt.redirect}' is not a valid value for enumeration RequestRedirect."`));
    return opt.redirect;
  })(options);

  if (url.protocol === 'https:') {
    requestParams.port = parseInt(url.port) || 443,
    requestParams.Socket = SecureSocket;
    requestParams.secure = {protocolVersion: 0x303};
    if (config.sslVerify && config.sslVerify.toLowerCase() === 'false') requestParams.secure.verify = false;
  }
  return new Promise((resolve, reject) => {
    try {
      const request = new Request(requestParams);
      const headers = new Headers();
      let status = 0;
      let statusText = '';
      let bodyUsed = false;
      let redirected = options && options.redirected ? options.redirected : false;
      let readableStreamDefaultReader = null;
      let body = null;
      let response = null;
let count = 0;
      request.callback = function(message, value, etc) {
        switch(message) {
        case 1:
          // response status received with status code
          status = parseInt(value);
          statusText = statusTextArray[status];
          break;
        case 2:
          // one header received (name, value)
          if (value && etc) headers.set(value.toLowerCase(), etc);
          break;
        case 3:
          // all headers received
          readableStreamDefaultReader = new ReadableStreamDefaultReader({request});
          body = new ReadableStream({readableStreamDefaultReader});
          response = new Response({
            href,
            bodyUsed,
            redirected,
            status,
            statusText,
            headers,
            body
          });
         resolve(response);
          break;
        case 4:
          // part of response body
          const buffer = request.read(ArrayBuffer);

          readableStreamDefaultReader._bodyArray.push(buffer);
          break;
        case 5:
          readableStreamDefaultReader._bodyArray.push(value);

          // all body received
          // const body = value;

          if (300 <= status && status <= 399 && headers['location']) {
            if (redirect === 'follow') {
              const redirectUrl = new URL(headers['location']);
              const redirectOptions = options || {};
              redirectOptions.redirected = true;
              resolve(fetch(redirectUrl.hostname ? headers['location'] : `${url.origin}${headers['location']}`, redirectOptions));
              return;
            } else if (redirect === 'error') {
              reject(new TypeError('NetworkError when attempting to fetch resource.'));
              return;
            }
          }
          break;
        case -2:
          reject('SSL: certificate: auth err');
          break;
        default:
          reject(value);
        }
      }
    } catch (e) {
      reject(e);
    }
  });
}

global.fetch = fetch;