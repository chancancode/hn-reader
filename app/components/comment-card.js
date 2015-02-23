import Ember from 'ember';

const CommentCard = Ember.Component.extend({
  classNames: ['comment-card'],
  classNameBindings: ['isExpanded:expanded'],

  actions: {
    toggleReplies: function() {
      var expanded = this.toggleProperty('isExpanded');

      if (expanded) {
        this.expandAll();
      }
    }
  },

  bodyStyle: function() {
    var quality = this.get('comment.quality');

    if (typeof quality === 'undefined') {
      quality = 1;
    }

    return `opacity: ${quality}`;
  }.property('comment.quality'),

  level: function() {
    var level = 0;

    var parent = this.get('parentView');

    while (parent instanceof CommentCard) {
      level += 1;
      parent = parent.get('parentView');
    }

    return level;
  }.property('parentView'),

  isExpanded: function() {
    return this.get('level') !== 2;
  }.property('level'),

  expandAll: function() {
    this.set('isExpanded', true);
    this.get('childViews').forEach( (child) => (child instanceof CommentCard) && child.expandAll() );
  }

});

export default CommentCard;
