import DS from "ember-data";
import Item from "hn-reader/models/item";

export default Item.extend({
  points:    DS.attr("number"),
  comments:  DS.attr("number"),
  submitter: DS.attr("string")
});
