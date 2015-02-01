/* global DOMParser: false */

var canUseDomParser = (function() {
  try {
    var html   = "<html><head><title>It works!</title></head><body></body></html>",
        parser = new DOMParser(),
        doc    = parser.parseFromString(html, "text/html");

    return doc.title === "It works!";
  } catch(e) {
    return false;
  }
})();

var parse;

if (canUseDomParser) {
  parse = function(html) {
    return new DOMParser().parseFromString(html, "text/html");
  };
} else {
  parse = function(html) {
    var iframe = document.createElement("iframe");

    iframe.src   = "about:blank";
    iframe.style = "display:none";

    document.body.appendChild(iframe);

    try {
      var doc = iframe.contentDocument;

      doc.open();
      doc.write(html);
      doc.close();

      return doc;
    } finally {
      document.body.removeChild(iframe);
    }
  };
}

// https://github.com/ariya/phantomjs/issues/11323
// https://github.com/ariya/phantomjs/issues/11906

var needHeadTagWorkAround = (function() {
  var html = "<html><head><meta name=\"referrer\" content=\"origin\"><link rel=\"stylesheet\" type=\"text/css\" href=\"news.css?BtneZCpVoHEQRJYJXD1G\"><link rel=\"shortcut icon\" href=\"favicon.ico\"><link rel=\"alternate\" type=\"application/rss+xml\" title=\"RSS\" href=\"rss\"><script type=\"text/javascript\">\nfunction byId(id) {\n  return document.getElementById(id);\n}\n\nfunction vote(node) {\n  var v = node.id.split(/_/);   // {'up', '123'}\n  var item = v[1];\n\n  // hide arrows\n  byId('up_'   + item).style.visibility = 'hidden';\n  byId('down_' + item).style.visibility = 'hidden';\n\n  // ping server\n  var ping = new Image();\n  ping.src = node.href;\n\n  return false; // cancel browser nav\n} </script><title>It works!</title></head><body></body></html>";
  return parse(html).title !== "It works!";
})();

if (needHeadTagWorkAround) {
  var _parse = parse;

  parse = function(html) {
    return _parse(html.replace(/<head[\s\S]+?<\/head>/g, ''));
  };
}

export default parse;
