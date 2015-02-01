import DS from 'ember-data';
import extractStories from "hn-reader/extractors/stories";

export default DS.RESTSerializer.extend({

  extractArray: function(store, type, payload) {
    payload = extractStories(payload);

    this.extractMeta(store, type, payload);

    return this._super(store, type, payload);
  }

});
