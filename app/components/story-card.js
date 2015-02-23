import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['story-card'],
  classNameBindings: ['isActive:active'],

  click(e) {
    if (e.target.tagName !== 'A' && !this.get('isActive')) {
      var link = this.$('.story-link');

      if (e.metaKey) {
        window.open(link.attr('href'), '_blank').focus();
      } else {
        link.click();
      }

      return false;
    } else {
      return true;
    }
  },

  isActive: function() {
    return this.get('router').isActive('stories.show', this.get('story'));
  }.property('router.url', 'story'),

  router: function() {
    var controller = this.get('controller');
    if (controller && controller.container) {
      return controller.container.lookup('router:main');
    }
  }.property(),
});
