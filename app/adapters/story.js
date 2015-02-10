import Ember from 'ember';
import DS from 'ember-data';
import config from 'hn-reader/config/environment';
import { isError } from 'hn-reader/extractors/stories';

export default DS.Adapter.extend({

  proxy: config.APP.CORS_PROXY,
  host: config.APP.HACKERNEWS_HOST,

  findAll(store, type) { this.findQuery(store, type); },

  findQuery(store, type, query = {}) {
    return new Ember.RSVP.Promise( (resolve, reject) => {

      var xhr = new XMLHttpRequest();

      xhr.open("GET", this.urlForQuery(query), true);
      xhr.responseType = "document";

      xhr.onload = () => {
        if (isError(xhr.response)) {
          Ember.run(null, reject, "Not found");
        } else {
          Ember.run(null, resolve, xhr.response);
        }
      };

      xhr.onerror = () => Ember.run(null, reject, xhr.statusText);

      xhr.send();

    });
  },

  urlForQuery({ filter, page }) {
    var url;

    filter = filter || "latest";

    switch (filter) {
      case "front-page":
        url = "news";
        break;

      case "latest":
        url = "newest";
        break;

      case "show-hn":
        url = "show";
        break;

      case "ask-hn":
        url = "ask";
        break;

      case "jobs":
        url = "jobs";
        break;

      default:
        throw "Unknown filter: " + filter;
    }

    if (page && filter === "latest") {
      url += `?next=${ encodeURIComponent(page) }`;
    } else if (page) {
      url += `?p=${ encodeURIComponent(page) }`;
    }

    return this.buildUrl(url);
  },

  buildUrl(path) {
    var parts = [];

    if (this.proxy) {
      parts.push( this.proxy.replace(/\/$/, "") );
    }

    if (this.host) {
      parts.push( this.host.replace(/\/$/, "") );
    }

    if (!parts.length) {
      parts.push("");
    }

    parts.push(path);

    return parts.join("/");
  },

});
