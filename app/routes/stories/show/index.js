import Ember from 'ember';

export default Ember.Route.extend({
  afterModel: function() {
    var story = this.modelFor('stories.show');

    if (story.get('isInternal')) {
      this.replaceWith('stories.show.comments', story);
    } else {
      this.replaceWith('stories.show.article', story);
    }
  }
});