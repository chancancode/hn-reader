import Ember from 'ember';
import DS from 'ember-data';

export default DS.Adapter.extend({

  findAll(store, type) { this.findQuery(store, type); },

  findQuery(store, type, query = {}) {
    return new Ember.RSVP.Promise( (resolve, reject) => {

      var xhr = new XMLHttpRequest();

      xhr.open("GET", this.urlForQuery(query), true);
      xhr.responseType = "document";

      xhr.onload  = () => Ember.run(null, resolve, xhr.response);
      xhr.onerror = () => Ember.run(null, reject, xhr.response);

      xhr.send();

    });
  },

  urlForQuery({ filter, page }) {
    var url;

    filter = filter || "latest";

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
      url += `?next=${ encodeURIComponent(page) }`;
    } else if (page) {
      url += `?p=${ encodeURIComponent(page) }`;
    }

    return url;
  },

});
