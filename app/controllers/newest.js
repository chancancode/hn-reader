import Ember from "ember";

export default Ember.ObjectController.extend({
  queryParams: ["since", "start"],
  since: "newest",
  start: 1,

  prevStart: function() {
    return this.get("start") - 30;
  }.property("start"),

  nextStart: function() {
    return this.get("start") + 30;
  }.property("start")
});
