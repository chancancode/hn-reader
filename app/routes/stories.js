import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    filter: { refreshModel: true }
  },

  model(params) {
    return this.store.find('story', params);
  }
});
