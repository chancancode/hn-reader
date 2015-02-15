import { extractArray, isError, resetGuid } from "hn-reader/extractors/story";

import fixtures from "../../fixtures";
import toDOM from "../../helpers/dom-parser";

module("Story extractor", {
  setup() { resetGuid(); }
});

function testMany(type, page) {
  var html = fixtures[type][`${page}.html`];
  var json = fixtures[type][`${page}.json`];

  test(`It should work with /${type}/${page}/`, function() {
    deepEqual( extractArray(toDOM(html)), json );
  });
}

testMany("news", 1);
testMany("news", 2);
testMany("news", 3);

testMany("newest", "newest");
testMany("newest", 8680063);
testMany("newest", 8680227);

testMany("show", 1);
testMany("show", 2);

testMany("ask", 1);
testMany("ask", 2);
testMany("ask", 5);

testMany("jobs", 1);

test("isError should return true for category error page (e.g. /ask?p=999)", function() {
  strictEqual( isError(toDOM(fixtures["not-found.html"])), true );
});

test("isError should return false for other pages", function() {
  strictEqual( isError(toDOM(fixtures.news["1.html"])), false );
});
