import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    // FIXME: add user page
    window.location.replace(`https://news.ycombinator.com/user?id=${ params.user_id }`);
  }
});
