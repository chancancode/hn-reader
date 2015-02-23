import Ember from 'ember';

export default Ember.View.extend({
  classNames: ['app-container'],

  didInsertElement() {
    this.$().on('click', '.app-nav a, .app-main *', () => {
      Ember.run( () => this.set('controller.showingNavBar', false) );
    });
  },

  willDestroyElement() {
    this.$().off('click');
  }
});
