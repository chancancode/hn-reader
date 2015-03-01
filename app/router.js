import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.resource("stories", function() {
    this.resource("stories.show", { path: "/:story_id" }, function () {
      this.route("article");
      this.route("comments");
    });
  });

  this.route("user", { path: "user/:user_id" });

  this.route("preferences");

  this.route("about");

});

export default Router;
