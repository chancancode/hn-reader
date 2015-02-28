import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var story = this.modelFor('stories.show');

    if (this.get('preferences.readibilityParserToken')) {
      return this.store.find( 'article', story.get('url') );
    } else {
      return { url: story.get('url'), error: true, noToken: true };
    }
  }
});
