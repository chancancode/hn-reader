import Ember from "ember";
import { resetGuid } from "hn-reader/extractors/index-page";
import startApp from "../helpers/start-app";
import Server from "../helpers/hacker-news-server";

var App;

var server;

module("Acceptance: Show", {
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

  visit("/show");

  andThen(function() {
    equal(currentURL(), "/show");

    items = find(".item .title");

    equal(items.length, 30);
    equal($(items[0]).text(), "MagicEye.js – Generate Magic Eye in Your Browser");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 0);
    strictEqual(next.length, 1);

    click(next);
  });

  andThen(function() {
    equal(currentURL(), "/show?page=2");

    items = find(".item .title");

    equal(items.length, 29);
    equal($(items[0]).text(), "Livedown – realtime Markdown previews for Vim, Emacs and Sublime");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 0);

    click(prev);
  });

  andThen(function() {
    equal(currentURL(), "/show");
  });
});

test("Visiting a specific page", function() {
  var items, prev, next;

  visit("/show?page=2");

  andThen(function() {
    equal(currentURL(), "/show?page=2");

    items = find(".item .title");

    equal(items.length, 29);
    equal($(items[0]).text(), "Livedown – realtime Markdown previews for Vim, Emacs and Sublime");

    prev = find("a[rel=prev]");
    next = find("a[rel=next]");

    strictEqual(prev.length, 1);
    strictEqual(next.length, 0);
  });
});
