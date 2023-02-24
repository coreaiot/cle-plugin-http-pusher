const http = require('./http');
const https = require('./https');
const http2 = require('./http2');

/**
 * @param {string} protocol 
 */
function createPoster(protocol) {
  switch (protocol) {
    case 'http': return new http.Poster();
    case 'https': return new https.Poster();
    case 'http2': return new http2.Poster();
    default:
      throw 'Unsupported protocol: ' + protocol;
  }
}

module.exports = { createPoster };