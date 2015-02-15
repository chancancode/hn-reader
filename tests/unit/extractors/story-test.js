import { extractSingle, extractArray, isError, resetGuid } from "hn-reader/extractors/story";

import fixtures from "../../fixtures";
import toDOM from "../../helpers/dom-parser";

module("Story extractor", {
  setup() { resetGuid(); }
});

function testSingle(id) {
  var html = fixtures.item[`${id}.html`];
  var json = fixtures.item[`${id}.json`];

  test(`It should work with item?id=${id}`, function() {
    if ( isError(toDOM(html)) ) {
      ok(false, `<ERROR \`tests/fixtures/item/${id}.html\`>`);
      ok(false, `<ERROR \`tests/fixtures/item/${id}.json\`>`);
    } else {
      deepEqual( extractSingle(toDOM(html)), json );
    }
  });
}

for(let file in fixtures.item) {
  if (file.indexOf(".json") > 0) {
    testSingle( file.replace(".json", "") );
  }
}

function testIndexPage(type, page) {
  var html = fixtures[type][`${page}.html`];
  var json = fixtures[type][`${page}.json`];

  test(`It should work with ${type}/${page}`, function() {
    deepEqual( extractArray(toDOM(html)), json );
  });
}

function testIndex(type) {
  for (let file in fixtures[type]) {
    if (file.indexOf(".json") > 0) {
      testIndexPage( type, file.replace(".json", "") );
    }
  }
}

testIndex("news");
testIndex("newest");
testIndex("show");
testIndex("ask");
testIndex("jobs");

test("isError should return true for item error page (e.g. /item?id=99999999)", function() {
  strictEqual( isError(toDOM(fixtures.item["not-found.html"])), true );
});

test("isError should return true for category error page (e.g. /ask?p=999)", function() {
  strictEqual( isError(toDOM(fixtures["not-found.html"])), true );
});

test("isError should return false for other pages", function() {
  strictEqual( isError(toDOM(fixtures.news["1.html"])), false );
});
