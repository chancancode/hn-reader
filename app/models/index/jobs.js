import DS from "ember-data";
import Ember from "ember";

Ember.Inflector.inflector.uncountable("index/jobs");

export default DS.Model.extend({
  prev:  DS.belongsTo("index/jobs", { async: true, inverse: "next" }),
  next:  DS.belongsTo("index/jobs", { async: true, inverse: "prev" }),
  items: DS.hasMany("item", { polymorphic: true })
});
