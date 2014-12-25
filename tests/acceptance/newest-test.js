import Ember from "ember";
import { resetGuid } from "hn-reader/extractors/index-page";
import startApp from "../helpers/start-app";
import Server from "../helpers/hacker-news-server";

var App;

var server;

module("Acceptance: Newest", {
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

  visit("/newest");

  andThen(function() {
    equal(currentURL(), "/newest");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "'Paper Switch' Swift module");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 1);

    click(next);
  });

  andThen(function() {
    equal(currentURL(), "/newest?since=8680227&start=31");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "Premature Attribution of Sony Breach to North Korea Irresponsible");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 1);

    click(prev);
  });

  andThen(function() {
    equal(currentURL(), "/newest");
  });
});

test("Visiting a specific page", function() {
  var items, prev, next;

  visit("/newest?since=8680063&start=61");

  andThen(function() {
    equal(currentURL(), "/newest?since=8680063");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "The tools we used to build a SaaS");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 1);
  });
});
