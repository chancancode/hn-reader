import DS from 'ember-data';

export default DS.Model.extend({
  title:   DS.attr('string'),
  author:  DS.attr('string'),
  body:    DS.attr('string'),
  error:   DS.attr('boolean'),
  message: DS.attr('string'),
});
