import Ember from "ember";

var $ = Ember.$;

var guid = 0;

export function resetGuid() {
  guid = 0;
}

function toArray(arr) {
  return [].map.call(arr, item => item);
}

function toInt(val) {
  return parseInt(val, 10) || 0;
}

function extractID(possibleID) {
  var match = /^(?:up_|item\?id=)(\d+)$/.exec(possibleID);
  return (match && match[1]) || null;
}

function generateID() {
  return `job-${ guid++ }`;
}

function extractTag(title) {
  if (title.indexOf("Show HN: ") === 0) {
    return "Show HN";
  } else if (title.indexOf("Ask HN: ") === 0) {
    return "Ask HN";
  } else {
    return null;
  }
}

function extractTitle(title) {
  var tag = extractTag(title);
  title = tag ? title.slice(tag.length + 2) : title;
  return title.replace(/\s+/g, " ").trim();
}

function extractSource(source) {
  var match = /^\((.+)\)$/.exec(source);
  return (match && match[1]) || null;
}

function extractSubmitted(text) {
  var match = /(\d+ \w+ ago)/.exec(text);
  return (match && match[1]) || null;
}

function extractStory(row1, row2) {
  var story = {
    id:        null,
    tag:       null,
    title:     null,
    url:       null,
    source:    null,
    points:    null,
    comments:  null,
    submitted: null,
    submitter: null
  };

  // There are three possible ways to extract the ID:
  //
  //   1. The ID attribute of the upvote link      <a id="up_9031419" href="..."><div class="votearrow" title="upvote"></div></a>
  //   2. The comments link href                   <a href="item?id=9031419">30 comments</a>
  //   3. The main link href (jobs & discussions)  <a href="item?id=9030790">Ask HN: How to get started freelancing?</a>
  //
  // Some jobs are external links that are neither up-votable nor commentable,
  // so we just have to generate an ID if we couldn't find one.

  story.id = extractID( $("a:has(.votearrow)", row1).attr("id") ) ||
             extractID( $(".subtext a:last-of-type", row2).attr("href") ) ||
             extractID( $(".title a", row1).attr("href") ) ||
             generateID();

  // A link on Hacker News usually look like this:
  //
  //   <a href="...">Show HN: A Unixy approach to WebSockets</a> <span class="comhead"> (websocketd.com)</span>
  //
  // We want to extract:
  //
  //   1. The title:  "A Unixy approach to WebSockets"
  //   2. The url:    "http://websocketd.com/"
  //   3. The source: "websocketd.com"
  //   4. The tag:    "Show HN" (or "Ask HN")
  //
  // Some links (typically Show HN, Ask HN and jobs) points to relative URLs
  // like "item?id=...", we want to normalize those into the full URLs here.
  //
  // For internal links that doesn't have the Show/Ask HN tag, we will label
  // them as "Discuss". Most of these should probably be labeled as "Job"
  // instead, but we will correct that later.

  var $title = $(".title > a", row1),
      titleText = $title.text().trim(),
      titleHref = $title.attr("href");

  story.tag   = extractTag(titleText);
  story.title = extractTitle(titleText);
  story.url   = titleHref;

  if (story.url.indexOf("item?id=") === 0) {
    story.tag = story.tag || "Discuss";
    story.url = `https://news.ycombinator.com/${story.url}`;
  }

  var source = $(".title .comhead", row1).text().trim();

  if (source) {
    story.source = extractSource(source);
  }

  // The second row looks something like this:
  //
  //  <td class="subtext">
  //    <span>155 points</span>
  //    by <a href="...">joewalnes</a>
  //    3 hours ago |
  //    <a href="...">30 comments</a>
  //  </td>
  //
  // We want to extract:
  //
  //   1. The number of points
  //   2. The number of comments
  //   3. The username of the submitter
  //   4. The submission time
  //
  // Everything besides jobs has all of these properties, so if we couldn't find
  // any of these, set the tag to "Job" and move on.

  var $points    = $(".subtext span:first-child", row2),
      $comments  = $(".subtext a:last-of-type", row2),
      $submitter = $(".subtext a:eq(0)", row2),
      submitted = $(".subtext", row2).text().trim();

  if ($points.length > 0 && $comments.length > 0 && $submitter.length > 0) {
    story.points    = toInt( $points.text() );
    story.comments  = toInt( $comments.text() );
    story.submitter = $submitter.text().trim();
    story.submitted = extractSubmitted( submitted );
  } else {
    story.tag = "Job";
    story.submitted = extractSubmitted( submitted );
  }

  return story;
}

export function extractArray(doc) {
  var meta = {},
      stories = [],
      payload = { meta, stories };

  try {
    meta.next = $("tr:last-child a:contains(More)", doc).attr("href").split(/=|&/)[1];
  } catch(e) {
    meta.next = null;
  }

  var rows = toArray( $("table table:eq(1) tr:has(.title):not(:last-child)", doc) );

  rows.forEach( row => {
    stories.push( extractStory(row, row.nextElementSibling) );
  });

  return payload;
}

export function isError(doc) {
  return $("table table:eq(1) tr", doc).length === 0;
}