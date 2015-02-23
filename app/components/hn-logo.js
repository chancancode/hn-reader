import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'i',
  classNames: ['hn-logo'],
  classNameBindings: ['animate:animated'],
  animate: false
});
