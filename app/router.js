import Ember from "ember";
import config from "./config/environment";

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("news");
  this.route("newest");
  this.route("show");
  this.route("ask");
  this.route("jobs");
});

export default Router;
