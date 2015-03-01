import Ember from 'ember';
import DS from 'ember-data';
import config from 'hn-reader/config/environment';

export default DS.Adapter.extend({

  proxy: config.APP.READIBILITY_PARSER_CORS_PROXY,
  host: config.APP.READIBILITY_PARSER_HOST,
  token: Ember.computed.alias('preferences.readibilityParserToken'),

  find(store, type, id) {
    return new Ember.RSVP.Promise( (resolve) => {

      var xhr = new XMLHttpRequest();

      xhr.open("GET", this.buildUrl(id), true);
      xhr.responseType = "json";

      xhr.onload = () => Ember.run(null, resolve, xhr.response);

      // We always "resolve" even when there is an error so we will remember not
      // to fetch it again
      xhr.onerror = () => {
        if (xhr.response) {
          Ember.run(null, resolve, xhr.response);
        } else {
          Ember.run(null, resolve, { error: true, messages: xhr.statusText });
        }
      };

      xhr.send();

    });
  },

  buildUrl(articleUrl) {
    var parts = [];

    if (this.get('proxy')) {
      parts.push( this.get('proxy').replace(/\/$/, "") );
    }

    if (this.get('host')) {
      parts.push( this.get('host').replace(/\/$/, "") );
    }

    if (!parts.length) {
      parts.push('');
    }

    return `${ parts.join('/') }?url=${ encodeURIComponent(articleUrl) }&token=${ encodeURIComponent(this.get('token')) }`;
  },

  _tokenChanged: function() {
    this.container.lookup('store:main').unloadAll('article');
  }.observes('token'),

});
