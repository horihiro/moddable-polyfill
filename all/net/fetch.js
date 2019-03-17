import {Request} from "http"
import SecureSocket from "securesocket";
import {URL} from 'URL';

class Response {
  constructor(params) {
    this.params = params;
  }
  get headers() {
    return  this.params.headers;
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
        const json = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(this.params.body)));
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
  }
  text() {
    return new Promise((resolve, reject) => {
      try {
        resolve(String.fromCharCode.apply(null, new Uint8Array(this.params.body)));
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
    response: ArrayBuffer,
    port: parseInt(url.port) || 80,
  };
  if (options) {
    requestParams.method = options.method ? options.method.toUpperCase() : 'GET';
    requestParams.headers = options.headers;
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
  }
  return new Promise((resolve, reject) => {
    try {
      const request = new Request(requestParams);
      const headers = {};
      let status = 0;
      let statusText = '';
      let bodyUsed = false;
      let redirected = options && options.redirected ? options.redirected : false;
        request.callback = function(message, value, etc) {
          switch(message) {
          case 1:
            // response status received with status code
            status = parseInt(value);
            statusText = statusTextArray[status];
            break;
          case 2:
            // one header received (name, value)
            if (value && etc) headers[value.toLowerCase()] = etc;
            break;
          case 3:
            // all headers received
            break;
          case 4:
            // part of response body
            break;
          case 5:
            // all body received
            const body = value;

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
            resolve(new Response({
              href,
              bodyUsed,
              redirected,
              status,
              statusText,
              headers,
              body
            }));
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