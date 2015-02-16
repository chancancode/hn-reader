import config from 'hn-reader/config/environment';
import FixturesServer from 'hn-reader/tests/helpers/hacker-news-server';

export function initialize() {
  if (config.APP.USE_FIXTURES_SERVER) {
    new FixturesServer();
  }
}

export default {
  name: '01-fixtures-server',
  initialize: initialize
};
