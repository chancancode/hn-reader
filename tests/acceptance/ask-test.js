import Ember from "ember";
import { resetGuid } from "hn-reader/extractors/index-page";
import startApp from "../helpers/start-app";
import Server from "../helpers/hacker-news-server";

var App;

var server;

module("Acceptance: Ask", {
  setup: function() {
    resetGuid();
    App = startApp();
    server = new Server();
  },

  teardown: function() {
    Ember.run(App, "destroy");
    server.shutdown();
  }
});

test("Visiting the front page", function() {
  var items, prev, next;

  visit("/ask");

  andThen(function() {
    equal(currentURL(), "/ask");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "Why Google Drive is showing 500?");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 1);

    click(next);
  });

  andThen(function() {
    equal(currentURL(), "/ask?page=2");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "Examples of profitable little free web tools?");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 1);

    click(prev);
  });

  andThen(function() {
    equal(currentURL(), "/ask");
  });
});

test("Visiting a specific page", function() {
  var items, prev, next;

  visit("/ask?page=5");

  andThen(function() {
    equal(currentURL(), "/ask?page=5");

    items = find(".item .title");

    equal(items.length, 5);
    equal($(items[0]).text(), "Speech to Text that keeps audio?");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 0);
  });
});
