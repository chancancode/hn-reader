/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'hn-reader',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created

      // Boot the server with OFFLINE=1 to enable this. Use the fixtures instead
      // of the live HN server, great for working at coffeeshops with bad wifi
      // and presenting at conferences ;)
      USE_FIXTURES_SERVER: false
    },

    contentSecurityPolicy: {
      "font-src":  "'self' http://fonts.gstatic.com",
      "style-src": "'self' http://fonts.googleapis.com"
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    if (process.env.OFFLINE) {
      ENV.APP.USE_FIXTURES_SERVER = true;
    } else {
      ENV.APP.CORS_PROXY      = 'https://cors-anywhere.herokuapp.com';
      ENV.APP.HACKERNEWS_HOST = 'https://news.ycombinator.com';

      ENV.contentSecurityPolicy['connect-src'] = "'self' https://cors-anywhere.herokuapp.com";
    }
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
