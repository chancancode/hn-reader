/* global FakeXMLHttpRequest: false */

import Pretender from "pretender";
import fixtures from "../fixtures";
import parse from "./dom-parser";

var _super = FakeXMLHttpRequest.prototype._setResponseBody;

FakeXMLHttpRequest.prototype._setResponseBody = function(body) {
  if (this.responseType === "document") {
    this.response = parse(body);
  }

  _super.call(this, body);
};

export default function(prefix = "") {
  return new Pretender(function() {

    var server = this;

    ["news", "show", "ask", "jobs"].forEach( type => {

      server.get(`/${type}` , request => {
        var page = request.queryParams.p || "1";
        var html = fixtures[type][`${page}.html`];

        if (html) {
          return [ 200, {"content-type": "text/html"}, html ];
        } else {
          return [ 200, {"content-type": "text/html"}, fixtures["not-found.html"] ];
        }
      });

    });

    server.get("/newest", request => {
      var page = request.queryParams.next || "newest";
      var html = fixtures.newest[`${page}.html`];

      if (html) {
        return [ 200, {"content-type": "text/html"}, html ];
      } else {
        return [ 200, {"content-type": "text/html"}, fixtures["not-found.html"] ];
      }
    });

    server.get("/item", request => {
      var id   = request.queryParams.id;
      var html = fixtures.item[`${id}.html`];

      if (html) {
        return [ 200, {"content-type": "text/html"}, html ];
      } else {
        return [ 200, {"content-type": "text/html"}, fixtures.item["not-found.html"] ];
      }
    });

  });

}
