import Ember from "ember";

export default Ember.Mixin.create({
  queryParams: ["page"],
  page: 1,

  start: function() {
    var page = this.get("page");
    return (page - 1) * 30 + 1;
  }.property("page")
});
