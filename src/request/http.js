const http = require('http');

class Poster {
  post(hostname, port, path, body, headers) {
    return new Promise((r, rr) => {
      const req = http.request({
        hostname,
        port,
        path,
        method: 'POST',
        headers,
      }, (res) => {
        let data = '';

        res.on('data', (d) => {
          data += d;
        });
        res.on('end', () => {
          if (res.statusCode >= 400)
            rr({ data, statusCode: res.statusCode });
          else
            r({ data, statusCode: res.statusCode });
        });
      });

      req.on('error', (e) => {
        rr(e);
      });
      req.write(body);
      req.end();
    });
  }
}

module.exports = { Poster };
