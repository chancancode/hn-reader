/* global FastClick */

import Ember from 'ember';

export function initialize() {
  Ember.run.schedule('afterRender', () => FastClick.attach(document.body));
}

export default {
  name: '02-fast-click',
  initialize: initialize
};
