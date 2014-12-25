import DS from "ember-data";

export default DS.Model.extend({
  prev:  DS.belongsTo("index/ask", { async: true, inverse: "next" }),
  next:  DS.belongsTo("index/ask", { async: true, inverse: "prev" }),
  items: DS.hasMany("item", { polymorphic: true })
});
