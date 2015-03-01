import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var story = this.modelFor('stories.show'), url = story.get('url');

    if (this.get('preferences.readibilityParserToken')) {
      return this.store.find( 'article', url )
        .catch( (reason) => {
          reason.url = url;
          return reason;
        });
    } else {
      return { url, error: true, noToken: true };
    }
  }
});
