import Server from "../../../helpers/hacker-news-server";
import { moduleFor, test } from "ember-qunit";
import fixtures from "../../../fixtures/index/show";
import { resetGuid } from "hn-reader/extractors/index-page";

var server;

moduleFor("adapter:index/show", "ShowIndexAdapter", {
  setup: function() {
    resetGuid();
    server = new Server();
  },

  teardown: function() {
    server.shutdown();
  },

  subject: function(options, factory) {
    return factory.create({
      proxy: null,
      host: null
    });
  }
});

test("Finding a page that exists", function() {
  return this.subject().find(null, "index/show", 1).then(function(json) {
    deepEqual( json, fixtures["1.json"] );
  });
});

test("Finding a page that does not exist", function() {
  return this.subject().find(null, "index/show", "zomg").catch(function(reason) {
    equal( reason, "Not Found" );
  });
});
