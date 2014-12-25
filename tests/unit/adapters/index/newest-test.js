import Server from "../../../helpers/hacker-news-server";
import { moduleFor, test } from "ember-qunit";
import fixtures from "../../../fixtures/index/newest";
import { resetGuid } from "hn-reader/extractors/index-page";

var server;

moduleFor("adapter:index/newest", "NewestIndexAdapter", {
  setup: function() {
    resetGuid();
    server = new Server();
  },

  teardown: function() {
    server.shutdown();
  }
});

test("Finding a page that exists", function() {
  return this.subject().find(null, { typeKey: "index/newest" }, 8680063).then(function(json) {
    deepEqual( json, fixtures["8680063.json"] );
  });
});

test("Finding the newest page", function() {
  return this.subject().find(null, { typeKey: "index/newest" }, "newest").then(function(json) {
    deepEqual( json, fixtures["newest.json"] );
  });
});

test("Finding a page that does not exist", function() {
  return this.subject().find(null, { typeKey: "index/newest" }, "zomg").catch(function(reason) {
    equal( reason, "Not Found" );
  });
});
