const http = require('http')
const https = require('https')
const http2 = require('http2')
const pem = require('pem')
const { gunzip } = require('zlib')

function handleData(req, res) {
  let data = Buffer.alloc(0);
  req.on('data', chunk => {
    data = Buffer.concat([data, chunk]);
  });
  req.on('end', () => {
    if (req.headers['content-encoding'] === 'gzip') {
      gunzip(data, (err, out) => {
        if (err) console.error(err);
        else {
          console.log('data', out.toString());
          res.end(JSON.stringify({}));
        }
      });
    } else {
      console.log('data', data.toString());
      res.end(JSON.stringify({}));
    }
  });
}

function handleDataWithAuth(req, res) {
  const token = req.headers.authorization && req.headers.authorization.slice(7);
  if (token === 'xxxxxx') {
    handleData(req, res);
  } else {
    res.statusCode = 401;
    res.end();
  }
}

function handleLogin(req, res) {
  let data = Buffer.alloc(0);
  req.on('data', chunk => {
    data = Buffer.concat([data, chunk]);
  });
  req.on('end', () => {
    try {
      const obj = JSON.parse(data.toString());
      if (obj.username !== 'test' || obj.password !== '123456')
        throw 'Wrong username or password.';
      res.end(JSON.stringify({
        token: 'xxxxxx',
      }));
    } catch (e) {
      console.error(e);
      res.statusCode = 400;
      res.end();
    }
  });
}

http.createServer((req, res) => {
  if (req.method === 'POST') {
    if (req.url === '/cle/http') {
      handleData(req, res);
      return;
    }
  }
}).listen(80);

pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {
    throw err
  }

  https.createServer({ key: keys.serviceKey, cert: keys.certificate }, (req, res) => {
    if (req.method === 'POST') {
      if (req.url === '/cle/login') {
        handleLogin(req, res);
        return;
      }

      if (req.url === '/cle/http') {
        handleDataWithAuth(req, res);
        return;
      }
    }
  }).listen(443)

  http2.createSecureServer({ key: keys.serviceKey, cert: keys.certificate }, (req, res) => {
    if (req.headers[':method'] === 'POST') {
      if (req.headers[':path'] === '/cle/login') {
        handleLogin(req, res);
        return;
      }

      if (req.headers[':path'] === '/cle/http') {
        handleDataWithAuth(req, res);
        return;
      }
    }
  }).listen(8443)
})