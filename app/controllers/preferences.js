import Ember from 'ember';

export default Ember.Controller.extend({

  topLevelOnly: function() {
    return this.get('preferences.autoFoldDepth') < 1;
  }.property('preferences.autoFoldDepth')

});