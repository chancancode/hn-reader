import DS from "ember-data";

export default DS.Model.extend({
  prev:  DS.belongsTo("index/newest", { async: true, inverse: "next" }),
  next:  DS.belongsTo("index/newest", { async: true, inverse: "prev" }),
  items: DS.hasMany("item", { polymorphic: true })
});
