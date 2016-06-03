import DS from 'ember-data';
import HNDocument from '../utils/hn-document';

const hnDocumentInstance = new HNDocument();

export default DS.RESTSerializer.extend({

  extractSingle(store, type, payload, id) {
    var article = {
      id: id,

      // Sucessful
      title: payload.title || null,
      author: payload.author || null,
      body: hnDocumentInstance.cleanMarkup(payload.content) || null,

      // Error
      error: payload.error || false,
      message: payload.messages || null
    };

    return this._super(store, type, { article }, id);
  }

});
