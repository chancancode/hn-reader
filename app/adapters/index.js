import Ember from "ember";
import DS from "ember-data";
import extract from "hn-reader/extractors/index-page";
import config from "hn-reader/config/environment";

export default DS.RESTAdapter.extend({
  proxy: config.APP.CORS_PROXY,
  host: config.APP.HACKERNEWS_HOST,
  path: Ember.required,
  param: "p",

  buildURL: function(type, id) {
    var url = [],
    proxy = this.get("proxy"),
    host = this.get("host"),
    namespace = this.get("namespace");

    if (proxy) { url.push(proxy); }
    if (host) { url.push(host);  }
    if (namespace) { url.push(namespace); }

    url.push(this.get("path"));

    url = url.join("/");

    if (id) {
      url = url + "?" + this.get("param") + "=" + encodeURIComponent(id);
    }

    if (proxy || host) {
      return url;
    } else {
      return "/" + url;
    }
  },

  ajax: function(verb, url, type, id) {
    return new Ember.RSVP.Promise(function(resolve, reject) {

      var xhr = new XMLHttpRequest();
      xhr.open(verb, url, true);
      xhr.responseType = "document";

      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(extract(type.typeKey, id, xhr.response));
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = function() {
        reject(xhr.statusText);
      };

      xhr.send();
    });
  },

  find: function(store, type, id, record) {
    var url = this.buildURL(type.typeKey, id, record);

    return this.ajax("GET", url, type, id);
  }

});
