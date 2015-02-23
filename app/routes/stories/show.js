import Ember from 'ember';

export default Ember.Route.extend({
  activate() {
    this.controllerFor('stories').set('hasContent', true);
  },

  deactivate() {
    this.controllerFor('stories').set('hasContent', false);
  }
});
