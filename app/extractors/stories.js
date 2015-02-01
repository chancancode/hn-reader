import Ember from "ember";

var $ = Ember.$;

var guid = 0;

export function resetGuid() {
  guid = 0;
}

function toId(id) {
  return `${id}`;
}

function toArray(arr) {
  return [].map.call(arr, item => item);
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

export default function(doc) {
  var meta = {},
      stories = [],
      payload = { meta, stories };


  try {
    meta.next = toId( toInt( $("tr:last-child a:contains(More)", doc).attr("href").split("=")[1] ) );
  } catch(e) {
    meta.next = null;
  }

  var rows = toArray( $("table table:eq(1) tr:has(.title, .subtext):not(:last-child)", doc) );

  rows.reduce( (story, row) => {
    var $row = $(".title, .subtext", row);

    if (!story) {
      // title row
      story = {};

      var title = $row.find("a").text().trim();

      story.title = parseTitle(title);
      story.tag = parseTag(title);
      story.url = $row.find("a").attr("href");

      if (story.url.indexOf("item?id=") === 0) {
        story.id  = toId( toInt( story.url.slice(8) ) );
        story.tag = story.tag || "Discuss";
        story.url = `https://news.ycombinator.com/${story.url}`;
      }

      story.source = $row.find(".comhead").text().replace(/[\(\)\s]/g, "");

      if (story.source.length === 0) {
        story.source = null;
      }

      return story;
    } else {
      // subtext row
      if ($row.children().length) {
        story.id = toId( toInt( $row.find("a:last-child").attr("href").split("=")[1] ) );
        story.points = toInt( $row.find("span:contains(points)").text() );
        story.submitter = $row.find("a:eq(0)").text().trim();
        story.submitted = $row.text().match(/[0-9]+ \w+ ago/)[0];
        story.comments = toInt( $row.find("a:contains(comment)").text() );

        stories.push(story);
      } else {
        if (!story.id) {
          // Some jobs do not have a (visible) ID, so we have to generate one
          story.id = `job-${guid++}`;
        }

        story.tag = "Job";
        story.points = null;
        story.submitter = null;
        story.submitted = $row.text().match(/[0-9]+ \w+ ago/)[0];
        story.comments = null;

        stories.push(story);
      }
    }
  }, undefined);

  return payload;
}
