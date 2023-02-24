const config = require('./config');
const i18n = require('./i18n');
const { createPoster } = require('./request/createPoster');
require('./type');
const { gzip } = require('zlib');

function compress(str) {
  return new Promise((r, rr) => {
    gzip(Buffer.from(str), (err, out) => {
      if (err) return rr(err);
      return r(out);
    });
  });
}

/**
 * @param {IPlugin} self 
 * @param {Object} env 
 * @param {IUtils} utils 
 * @param {IGateways} gateways 
 * @param {IBeacons} beacons 
 * @returns {Promise<boolean>}
 */
async function init(self, env, utils, gateways, beacons) {
  const config = await utils.loadConfig(self);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.compress) {
    headers['Content-Encoding'] = 'gzip';
  }

  const poster = createPoster(config.protocol);

  const startRefreshToken = async () => {
    while (true) {
      try {
        const res = await poster.post(config.host, config.port, config.loginApiPath, JSON.stringify({
          username: config.username,
          password: config.password,
        }), {
          'Content-Type': 'application/json',
        });
        const obj = JSON.parse(res.data);
        if (self.debug)
          self.logger.debug('token:', obj.token);
        headers.Authorization = `Bearer ${obj.token}`;
        await new Promise(r => setTimeout(r, 1000 * config.refreshTokenPeriod));
      } catch (e) {
        self.logger.error(e);
        delete headers.Authorization;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  if (config.username) {
    startRefreshToken();
  }

  setInterval(() => {
    if (config.username && !headers.Authorization) return;

    const now = new Date().getTime();

    const data = {};
    for (const [k, v] of Object.entries(beacons)) {
      const exp = config.postOutdatedTags ? v.updatedAt + env.beaconLifetime : v.updatedAt + env.beaconAuditTime;
      if (v.x !== undefined && exp > now)
        data[k] = v;
    }
    if (Object.keys(data).length) {
      const json = JSON.stringify({
        type: 'sensors',
        data,
      });
      if (config.compress) {
        compress(json)
          .then(body => poster.post(config.host, config.port, config.apiPath, body, headers))
          .catch(e => self.logger.error(e));
      } else {
        poster.post(config.host, config.port, config.apiPath, json, headers)
          .catch(e => self.logger.error(e));
      }
    }
  }, env.beaconAuditTime);

  setInterval(() => {
    if (config.username && !headers.Authorization) return;

    const data = {};
    const now = new Date().getTime();
    for (const [k, v] of Object.entries(gateways)) {
      data[k] = {
        ...v,
        online: v.updatedAt + env.gatewayLifeTime >= now,
      };
    }

    const json = JSON.stringify({
      type: 'locators',
      data,
    });
    if (config.compress) {
      compress(json)
        .then(body => poster.post(config.host, config.port, config.apiPath, body, headers))
        .catch(e => self.logger.error(e));
    } else {
      poster.post(config.host, config.port, config.apiPath, json, headers)
        .catch(e => self.logger.error(e));
    }
  }, env.gatewayAuditTime);
  return true;
}

/**
 * @param {IPlugin} self
 * @param {IUtils} utils
 */
async function test(self, utils) {
  self.logger.info('Test', self.name);
  self.logger.info('Loading Config ..');
  const config = await utils.loadConfig(self);
  console.log(config);

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (config.compress) {
      headers['Content-Encoding'] = 'gzip';
    }

    const poster = createPoster(config.protocol);
    if (config.username) {
      const res = await poster.post(config.host, config.port, config.loginApiPath, JSON.stringify({
        username: config.username,
        password: config.password,
      }), {
        'Content-Type': 'application/json',
      });
      const obj = JSON.parse(res.data);
      console.log('token:', obj.token);
      headers.Authorization = `Bearer ${obj.token}`;
      self.logger.info('Token OK.');
    }

    let body = JSON.stringify({
      type: 'sensors',
      data: {},
    });
    if (config.compress) {
      body = await compress(body);
    }
    await poster.post(config.host, config.port, config.apiPath, body, headers);
    self.logger.info('Post OK.');
    process.exit(0);
  } catch (e) {
    self.logger.error(e);
    process.exit(1);
  }
}

module.exports = { init, test, config, i18n };
