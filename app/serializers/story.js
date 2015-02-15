import DS from 'ember-data';
import {
  extractSingle as parseSingle,
  extractArray as parseArray
} from "hn-reader/extractors/story";

export default DS.RESTSerializer.extend({

  extractSingle(store, type, payload, id) {
    payload = parseSingle(payload);

    this.extractMeta(store, type, payload);

    return this._super(store, type, payload, id);
  },

  extractArray(store, type, payload) {
    payload = parseArray(payload);

    this.extractMeta(store, type, payload);

    return this._super(store, type, payload);
  }

});
