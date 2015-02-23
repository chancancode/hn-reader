import Ember from 'ember';

export default Ember.ArrayController.extend({
  queryParams: ['filter', 'page'],

  filter: 'front-page',
  page: null,

  hasContent: false,

  filterName: function() {
    switch( this.get('filter') ) {
      case 'front-page':
        return 'Front Page';

      case 'latest':
        return 'Latest Submissions';

      case 'active':
        return 'Active';

      case 'show-hn':
        return 'Show HN';

      case 'ask-hn':
        return 'Ask HN';

      case 'jobs':
        return 'Jobs';
    }
  }.property('filter')
});