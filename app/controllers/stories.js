import Ember from 'ember';

export default Ember.ArrayController.extend({
  queryParams: ['filter', 'page'],

  filter: 'front-page',
  page: null,
});