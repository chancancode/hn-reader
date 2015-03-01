import config from 'hn-reader/config/environment';

// FIXME: Can't use import here, because this file is not present in prod build
try {
  /* globals require: false */
  var FixturesServer = require('hn-reader/tests/helpers/hacker-news-server')['default'];
} catch(e) {
  // Ignore
}

export function initialize() {
  if (config.APP.USE_FIXTURES_SERVER) {
    new FixturesServer();
  }
}

export default {
  name: '01-fixtures-server',
  initialize: initialize
};
