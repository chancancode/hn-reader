import Ember from "ember";

export default Ember.Route.extend({
  queryParams: {
    since: { refreshModel: true }
  },

  model: function(params) {
    return this.store.find("index/newest", params.since);
  },

  setupController: function (controller, model) {
    this._super(controller, model);

    if (model.get("prev.id") === undefined) {
      controller.set("start", 1);
    }
  }
});
