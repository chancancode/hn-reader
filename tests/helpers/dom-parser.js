/* global DOMParser: false */

export default function(html) {
  var parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}
