import { default as parse, resetGuid } from "hn-reader/extractors/stories";

import fixtures from "../../fixtures";
import toDOM from "../../helpers/dom-parser";

module("Stories extractor", {
  setup() { resetGuid(); }
});

function testPage(type, page) {
  var html = fixtures[type][`${page}.html`];
  var json = fixtures[type][`${page}.json`];

  test("It should work with /" + type + "/" + page, function() {
    deepEqual( parse(toDOM(html)), json );
  });
}

testPage("news", 1);
testPage("news", 2);
testPage("news", 3);

testPage("newest", "newest");
testPage("newest", 8680063);
testPage("newest", 8680227);

testPage("show", 1);
testPage("show", 2);

testPage("ask", 1);
testPage("ask", 2);
testPage("ask", 5);

testPage("jobs", 1);
