import Ember from "ember";
import { resetGuid } from "hn-reader/extractors/index-page";
import startApp from "../helpers/start-app";
import Server from "../helpers/hacker-news-server";

var App;

var server;

module("Acceptance: News", {
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

  visit("/news");

  andThen(function() {
    equal(currentURL(), "/news");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "The State of JavaScript in 2015");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 1);

    click(next);
  });

  andThen(function() {
    equal(currentURL(), "/news?page=2");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "Nasty Lockup Issue Still Being Investigated for Linux 3.18");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 1);

    click(prev);
  });

  andThen(function() {
    equal(currentURL(), "/news");
  });
});

test("Visiting a specific page", function() {
  var items, prev, next;

  visit("/news?page=3");

  andThen(function() {
    equal(currentURL(), "/news?page=3");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "New Vaccine Developed to Prevent Lyme Disease");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 1);
  });
});
