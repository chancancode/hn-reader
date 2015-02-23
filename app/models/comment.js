import DS from 'ember-data';

export default DS.Model.extend({
  isDead:    DS.attr('boolean'),
  body:      DS.attr('string'),
  quality:   DS.attr('number'),
  submitter: DS.attr('string'),
  submitted: DS.attr('string'),
  parent:    DS.belongsTo('comment', { inverse: 'comments' }),
  comments:  DS.hasMany('comment', { inverse: 'parent' }),
  story:     DS.belongsTo('story'),

  descendantsCount: function() {
    return this.get('comments').reduce( (count, comment) => count + comment.get('descendantsCount'), this.get('comments.length') );
  }.property('comments'),

  nestedCommentsCount: function() {
    return this.get('descendantsCount') - this.get('comments.length');
  }.property('descendantsCount', 'comments.length')
});
