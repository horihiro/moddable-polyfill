export class URLSearchParams {

}

export class URL {
  constructor(url) {
    this.parseHost = function(value) {
      const INDEX_HOSTNAME = 1;
      const INDEX_PORT = 2;
      const re = /([^/]+)(?::)?/;
      const parsed = value.match(re);
  
      this.hostname = parsed && parsed[INDEX_HOSTNAME] || '';
      this.port = (parsed && parsed[INDEX_PORT] || '').replace(/^0*/, '');
    };
    // this.parseOrigin = function(origin) {
    //   const INDEX_PROTOCOL = 1;
    //   const INDEX_HOST = 2;
    //   const re = /([^a-z0-9]+)?:\/\/([^/]+)/i;
    //   const parsed = value.match(re);
  
    //   this.protocol = parsed && parsed[INDEX_PROTOCOL] || '';
    //   this.parseHost(parsed && parsed[INDEX_HOST] || '');
    // }
    this.parseHref = function (value) {
      const INDEX_PROTOCOL = 1;
      const INDEX_USERNAME = 2;
      const INDEX_PASSWORD = 3;
      const INDEX_HOSTNAME = 4;
      const INDEX_PORT = 5;
      const INDEX_PATHNAME = 6;
      const INDEX_SEARCH = 7;
      const INDEX_HASH = 8;
      const re = /(?:([a-z0-9]+:)?\/\/(?:([^:]*)(?::([^@]*))?@)?(?:([^\/:]+)(?::(\d+))?))?([^?#]*)(\?[^#]*)?(#.*)?/i;

      const parsed = value.match(re);
      this.protocol = (parsed && parsed[INDEX_PROTOCOL] || '').toLowerCase();
      this.username = parsed && parsed[INDEX_USERNAME] || '';
      this.password = parsed && parsed[INDEX_PASSWORD] || '';
      this.hostname = parsed && parsed[INDEX_HOSTNAME] || '';
      this.port = (parsed && parsed[INDEX_PORT] || '').replace(/^0*/, '');
      this.pathname = parsed && parsed[INDEX_PATHNAME] || '/';
      this.search = parsed && parsed[INDEX_SEARCH] || '';
      this.hash = parsed && parsed[INDEX_HASH] || '';

      // this.host = this.hostname + (this.port ? `:${this.port}` : '');
      // this.origin = `${this.protocol}://${this.origin}`;
      // this.href = `${this.origin}${this.pathname}${this.search}${this.hash}`;
    }
    this.parseHref(url);
  }

  // href
  set href(value) {
    this.parseHref(value);
  }
  get href() {
    return `${this.origin}${this.pathname}${this.search}${this.hash}`;
  }

  // origin
  get origin() {
    return `${this.protocol}//${this.host}`;
  }

  // host
  set host(value) {
    this.parseHost(value);
  }
  get host() {
    return this.hostname + (this.port || '')
  }
}
