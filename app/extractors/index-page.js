import Ember from "ember";

var $ = Ember.$;

var guid = 0;

export function resetGuid() {
  guid = 0;
}

function toArray(arr) {
  return [].map.call(arr, function(item) { return item; });
}

function toInt(val) {
  return parseInt(val, 10) || 0;
}

function parseTag(title) {
  if (title.indexOf("Show HN: ") === 0) {
    return "Show HN";
  } else if (title.indexOf("Ask HN: ") === 0) {
    return "Ask HN";
  } else {
    return null;
  }
}

function parseTitle(title) {
  var tag = parseTag(title);
  return tag ? title.slice(tag.length + 2) : title;
}

export default function(type, id, doc) {
  var page = { id: id, items: [] };

  try {
    page.next = toInt( $("tr:last-child a:contains(More)", doc).attr("href").split("=")[1] );
  } catch(e) {
    page.next = null;
  }

  if (type !== "index/newest") {
    page.prev = (id > 1) ? (id - 1) : null;
  }

  var stories = [];
  var jobs    = [];

  var rows = toArray( $("table table:eq(1) tr:has(.title, .subtext):not(:last-child)", doc) );

  rows.reduce(function(item, row) {
    var $row = $(".title, .subtext", row);

    if (!item) {
      // title row
      item = {};

      var title = $row.find("a").text().trim();

      item.title = parseTitle(title);
      item.tag = parseTag(title);
      item.url = $row.find("a").attr("href");

      if (item.url.indexOf("item?id=") === 0) {
        item.tag = item.tag || "Discuss";
        item.url = "https://news.ycombinator.com/" + item.url;
      }

      item.source = $row.find(".comhead").text().replace(/[\(\)\s]/g, "");

      if (item.source.length === 0) {
        item.source = null;
      }

      return item;
    } else {
      // subtext row
      if ($row.children().length) {
        item.id = toInt( $row.find("a:last-child").attr("href").split("=")[1] );
        item.points = toInt( $row.find("span:contains(points)").text() );
        item.submitter = $row.find("a:eq(0)").text().trim();
        item.submitted = $row.text().match(/[0-9]+ \w+ ago/)[0];
        item.comments = toInt( $row.find("a:contains(comment)").text() );

        stories.push(item);
        page.items.push({
          id: item.id,
          type: "story"
        });
      } else {
        // Jobs do not have a (visible) ID, so we have to generate one
        item.id = guid++;
        item.tag = "Job";
        item.submitted = $row.text().match(/[0-9]+ \w+ ago/)[0];

        jobs.push(item);
        page.items.push({
          id: item.id,
          type: "job"
        });
      }
    }
  }, undefined);

  var response = {};

  response[type] = page;
  response.stories = stories;
  response.jobs = jobs;

  return response;
}
