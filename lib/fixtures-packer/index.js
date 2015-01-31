var path = require("path");
var Packer = require("./lib/broccoli-packer");
var Funnel = require("broccoli-funnel");

module.exports = {
  name: 'fixtures-packer',

  isDevelopingAddon: function() {
    return true;
  },

  treeFor: function(type) {
    if (type === "test-support") {
      var fixturesPath = path.join(this.app.project.root, "tests/fixtures");

      var fixtures = new Funnel(fixturesPath, { exclude: [/(^|\/)\./, /\.js$/], destDir: "fixtures" });

      return new Packer(fixtures, { importPrefix: "tests" });
    }
  }
};
