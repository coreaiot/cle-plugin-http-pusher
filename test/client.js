const { createPoster } = require('../src/request/createPoster');
const { gzip } = require('zlib');

function compress(str) {
  return new Promise((r, rr) => {
    gzip(Buffer.from(str), (err, out) => {
      if (err) return rr(err);
      return r(out);
    });
  });
}

async function testHttp() {
  console.log('Test http');
  const hostname = 'localhost';
  const port = 80;
  const poster = createPoster('http');

  const body = JSON.stringify({
    data: 'dummy',
  });
  const compressedBody = await compress(body);
  await poster.post(hostname, port, '/cle/http', body, {
    'Content-Type': 'application/json',
  });
  console.log('Post json OK.')
  await poster.post(hostname, port, '/cle/http', compressedBody, {
    'Content-Encoding': 'gzip',
    'Content-Type': 'application/json',
  });
  console.log('Post gzip OK.')
}

async function testHttps(protocol, port) {
  console.log('Test', protocol);
  const hostname = 'localhost';
  const poster = createPoster(protocol);

  const res = await poster.post(hostname, port, '/cle/login', JSON.stringify({
    username: 'test',
    password: '123456',
  }), {
    'Content-Type': 'application/json',
  });
  const obj = JSON.parse(res.data);

  const body = JSON.stringify({
    data: 'dummy',
  });
  const compressedBody = await compress(body);
  await poster.post(hostname, port, '/cle/http', body, {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${obj.token}`,
  });
  console.log('Post json OK.')
  await poster.post(hostname, port, '/cle/http', compressedBody, {
    'Content-Encoding': 'gzip',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${obj.token}`,
  });
  console.log('Post gzip OK.')
}

(async () => {
  try {
    await testHttp();
    await testHttps('https', 443);
    await testHttps('http2', 8443);
    process.exit(0);
  } catch (e) {
    console.error('>>>', e);
  }
})();