const http2 = require('http2');

class Poster {

  /**
   * @type {import('http2').ClientHttp2Session}
   */
  session = { closed: true };

  connect(hostname, port) {
    return new Promise((r, rr) => {
      const s = http2.connect({
        hostname, port,
      }, {
        rejectUnauthorized: false,
      });
      s.once('connect', () => {
        this.session = s;
        r();
      });
      s.on('error', rr);
    })
  }

  async post(hostname, port, path, body, headers) {
    if (this.session.closed) {
      await this.connect(hostname, port);
    }

    return await Promise.race([
      new Promise((_, rr) => setTimeout(rr, 5000)),
      new Promise((r, rr) => {
        const req = this.session.request({
          [http2.constants.HTTP2_HEADER_PATH]: path,
          [http2.constants.HTTP2_HEADER_METHOD]: 'POST',
          ...headers,
        });
        req.write(body);
        req.end();

        req.setEncoding('utf8');
        let data = '';
        let statusCode;
        req.on('response', res => {
          statusCode = res[http2.constants.HTTP2_HEADER_STATUS];
        })
        req.on('data', (chunk) => { data += chunk });
        req.on('end', () => {
          if (statusCode >= 400)
            rr({ statusCode, data });
          else
            r({ statusCode, data });
        });
      }),
    ]);
  }
}

module.exports = { Poster };