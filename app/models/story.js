import DS from 'ember-data';

export default DS.Model.extend({
  tag:       DS.attr('string'),
  title:     DS.attr('string'),
  url:       DS.attr('string'),
  source:    DS.attr('string'),
  points:    DS.attr('number'),
  comments:  DS.attr('number'),
  submitted: DS.attr('string'),
  submitter: DS.attr('string'),

  hasPoints: function() {
    return this.get('points') !== null;
  }.property('points'),

  hasComments: function() {
    return this.get('comments') !== null;
  }.property('comments')
});
