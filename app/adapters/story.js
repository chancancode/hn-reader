import Ember from 'ember';
import DS from 'ember-data';

export default DS.Adapter.extend({

  findAll: function(store, type) {
    return this.findQuery(store, type);
  },

  findQuery: function(store, type, query) {
    var url = this.urlForQuery(query || {});

    return new Ember.RSVP.Promise(function(resolve, reject) {

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "document";

      xhr.onload = function() {
        Ember.run(null, resolve, xhr.response);
      };

      xhr.onerror = function() {
        Ember.run(null, reject, xhr.response);
      };

      xhr.send();
    });
  },

  urlForQuery: function(query) {
    var url,
        filter = query.filter || "latest",
        page   = query.page;

    switch (filter) {
      case "front-page":
        url = "/news";
        break;

      case "latest":
        url = "/newest";
        break;

      case "show-hn":
        url = "/show";
        break;

      case "ask-hn":
        url = "/ask";
        break;

      case "jobs":
        url = "/jobs";
        break;

      default:
        throw "Unknown filter: " + filter;
    }

    if (page && filter === "latest") {
      url += "?next=" + encodeURIComponent(page);
    } else if (page) {
      url += "?p=" + encodeURIComponent(page);
    }

    return url;
  },

});
