import IndexAdapter from "hn-reader/adapters/index";

export default IndexAdapter.extend({
  path: "newest",
  param: "next",

  buildURL: function(type, id) {
    if (id === "newest") {
      return this._super(type);
    } else {
      return this._super(type, id);
    }
  }
});
