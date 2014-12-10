import { default as extract, resetGuid } from "hn-reader/extractors/index-page";

import fixtures from "../../fixtures/index";
import parse from "../../helpers/dom-parser";

module("Index page extractor", {
  setup: function() {
    resetGuid();
  }
});

function testPage(type, page) {
  var html = fixtures[type][page + ".html"];
  var json = fixtures[type][page + ".json"];

  test("It should work with /" + type + "/" + page, function() {
    deepEqual( extract("index/" + type, page, parse(html)), json );
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
