import DS from 'ember-data';
import { extractArray as parseArray } from "hn-reader/extractors/story";

export default DS.RESTSerializer.extend({

  extractArray(store, type, payload) {
    payload = parseArray(payload);

    this.extractMeta(store, type, payload);

    return this._super(store, type, payload);
  }

});
