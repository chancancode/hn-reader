import DS from 'ember-data';

export default DS.Model.extend({
  isDead:    DS.attr('boolean'),
  body:      DS.attr('string'),
  quality:   DS.attr('number'),
  submitter: DS.attr('string'),
  submitted: DS.attr('string'),
  parent:    DS.belongsTo('comment', { inverse: 'comments' }),
  comments:  DS.hasMany('comment', { inverse: 'parent' }),
  story:     DS.belongsTo('story')
});
