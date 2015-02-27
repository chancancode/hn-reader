import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    willTransition: function(transition) {
      if ( this.shouldAnimate(transition) ) {
        // Defer the transition until the view is slid outside of the viewport
        transition.abort();

        this.controllerFor('stories').set('hasContent', false);

        Ember.run.later( () => {
          transition.didCompleteAnimation = true;
          transition.retry();
        }, 250 );
      }
    }
  },

  beforeModel() {
    this.controllerFor('stories').set('hasContent', true);
  },

  model(params) {
    return this.store.fetch('story', params.story_id);
  },

  afterModel(story) {
    if (!story.get('isInternal') && this.get('preferences.readibilityParserToken')) {
      // Pre-fetch the article here so it stays on the same "loading" screen
      return this.store.find( 'article', story.get('url') )
    }
  },

  activate() {
    this.controllerFor('stories').set('hasContent', true);
  },

  deactivate() {
    this.controllerFor('stories').set('hasContent', false);
  },

  shouldAnimate(transition) {
    return transition.targetName.indexOf('stories.show') < 0 &&
      this.controllerFor('stories').get('hasContent') &&
      Ember.$('.app-content .app-bar:visible').length > 0;
  }
});
