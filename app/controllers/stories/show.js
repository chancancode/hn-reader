import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['stories'],

  filterName: Ember.computed.alias('controllers.stories.filterName')
});