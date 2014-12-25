import Ember from "ember";
import { resetGuid } from "hn-reader/extractors/index-page";
import startApp from "../helpers/start-app";
import Server from "../helpers/hacker-news-server";

var App;

var server;

module("Acceptance: Jobs", {
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

  visit("/jobs");

  andThen(function() {
    equal(currentURL(), "/jobs");

    items = find(".item .title");

    equal(items.length, 23);
    equal($(items[0]).text(), "Airware (YC W13) is building commercial drones in downtown SF");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 0);
  });
});

test("Visiting a specific page", function() {
  var items, prev, next;

  visit("/jobs?page=1");

  andThen(function() {
    equal(currentURL(), "/jobs");

    items = find(".item .title");

    equal(items.length, 23);
    equal($(items[0]).text(), "Airware (YC W13) is building commercial drones in downtown SF");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 0);
  });
});
