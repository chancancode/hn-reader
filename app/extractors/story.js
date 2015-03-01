import Ember from "ember";

var $ = Ember.$;

var guid = 0;

export function resetGuid() {
  guid = 0;
}

function toArray(arr) {
  return [].map.call(arr, item => item);
}

function toInt(val, base = 10) {
  return parseInt(val, base) || 0;
}

function extractID(possibleID) {
  var match = /^(?:up_|item\?id=)(\d+)$/.exec(possibleID);
  return (match && match[1]) || null;
}

function generateID(prefix = "dead") {
  return `${prefix}-${ guid++ }`;
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

function extractQuality(color) {
  var match = /#([0-9a-f]{2})[0-9a-f]{4}/i.exec(color);
  if (match && match[1]) {
    return ( 255 - toInt(match[1], 16) ) / 255;
  } else {
    return null;
  }
}

function extractBody(lines) {
  return toArray(lines).map( line => (line.innerText || line.textContent).replace(/\s/g, " ").trim() ).join("\n\n") || null;
}

function extractComment(story, row) {
  // A normal comment row looks like this:
  //
  //   <tr>
  //     <td><img src="s.gif" height="1" width="40"></td>
  //     <td>...vote arrows...</td>
  //     <td>
  //       <div>
  //         <span class="comhead">
  //           <a href="...">cbd1984</a> <a href="item?id=9052474">12 hours ago</a> <span class="deadmark"></span>
  //         </span>
  //       </div>
  //       <br>
  //       <span class="comment">
  //         <font color="#000000">
  //           ...
  //           <p><font color="#000000">...</font></p>
  //           <p><font color="#000000">...</font></p>
  //           <p><font size="1"><u><a href="...">reply</a></u></font></p>
  //         </font>
  //       </span>
  //     </td>
  //   </tr>
  //
  // From here, we want to extract:
  //
  //   1. The ID of the comment
  //   2. The nesting level
  //   3. The submitter username
  //   4. The submission time
  //   5. The "quality" of the comment
  //   6. The body of the comment
  //
  // Most of these should be self-explainatory. The "nesting level" is the width
  // of the spacer gif (see `extractComments` for how its used). The quality is
  // represented visually via the font color with different shades of gray. We
  // normalize it to a float between 0 and 1 where 0 (#ffffff) is the worst and
  // 1 (#000000) is normal.
  //
  // But a comment could also be dead (deleted), in which case it looks like
  // this:
  //
  //   <tr>
  //     <td><img src="s.gif" height="1" width="80"></td>
  //     <td><span class="deadmark"></span></td>
  //     <td>
  //       <div>
  //         <span class="comhead">...</span>
  //       </div>
  //       <span class="comment">[deleted]</span>
  //     </td>
  //   </tr>
  //

  var comment = {
    id:        null,
    isDead:    false,
    body:      null,
    quality:   null,
    submitter: null,
    submitted: null,
    level:     null,
    parent:    null,
    comments:  [],
    story:     story.id
  };

  var $spacer    = $("img[src='s.gif'][width]", row),
      $comhead   = $(".comhead", row),
      $body      = $(".comment font", row),
      $submitter = $comhead.find("a:first-of-type"),
      $submitted = $comhead.find("a:last-of-type");

  if ($submitted.length) {
    comment.id = extractID( $submitted.attr("href") );

    if ($body.last().find("a[href^=reply]").length) {
      comment.body = extractBody( $body.not(":last") );
    } else {
      comment.body = extractBody( $body );
    }

    comment.quality = extractQuality( $body.first().attr("color") ) || 1;
    comment.submitter = $submitter.text().trim();
    comment.submitted = extractSubmitted( $submitted.text().trim() );
  } else {
    comment.id = generateID();
    comment.isDead = true;
  }

  comment.level = toInt( $spacer.attr("width") );

  return comment;
}

function extractComments(story, rows) {
  var comments = [];

  story.comments = [];

  // Keep track of the nesting of the comments. This is orangized as a stack of
  // { level, parent, lastSibling } tuples.
  //
  // The nesting level is an "arbitary" integer scale where larger numbers means
  // deeper nesting. (In reality, this number corresponding to the width of
  // indentation/padding in the markup.)
  //
  // The parent is parent for all comments at this level, i.e. the most recently
  // seen comment from the previous level.
  //
  // The lastSibling is the most recently seen comment at this level.

  var nesting = [ [0, null, null] ];

  toArray(rows).forEach( (row) => {
    let comment = extractComment(story, row);

    let level, parentComment, lastSibling;

    [level, parentComment, lastSibling] = nesting[0];

    while (comment.level < level) {
      nesting.shift();
      [level, parentComment, lastSibling] = nesting[0];
    }

    if (comment.level === level) {
      comment.parent = parentComment && parentComment.id;
      nesting[0][2]  = comment;
    } else {
      parentComment  = lastSibling;
      comment.parent = parentComment.id;
      nesting.unshift( [comment.level, parentComment, comment] );
    }

    comments.push( comment );

    if (parentComment) {
      parentComment.comments.push( comment.id );
    } else {
      story.comments.push( comment.id );
    }

    delete comment.level;
  });

  return comments;
}

function extractStory(row1, row2, row3, commentRows) {
  var story = {
    id:        null,
    tag:       null,
    title:     null,
    url:       null,
    source:    null,
    body:      null,
    points:    null,
    submitter: null,
    submitted: null,
    comments:  null,
    commentsCount: null
  };

  var comments = [];

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
             generateID("job");

  // A link on Hacker News usually look like this:
  //
  //   <a href="...">Show HN: A Unixy approach to WebSockets</a> <span class="sitebit comhead"> (websocketd.com)</span>
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

  var source = $(".title .sitebit", row1).text().trim();

  if (source) {
    story.source = extractSource(source);
  }

  // The second row looks something like this:
  //
  //  <td class="subtext">
  //    <span class="score" id="...">155 points</span>
  //    by <a href="...">joewalnes</a>
  //    <a href="...">3 hours ago</a> |
  //    <a href="...">30 comments</a>
  //  </td>
  //
  // We want to extract:
  //
  //   1. The number of points
  //   2. The number of comments
  //   3. The submitter username
  //   4. The submission time
  //
  // Everything besides jobs has all of these properties, so if we couldn't find
  // any of these, set the tag to "Job" and move on. For jobs, the "3 hours ago"
  // is not linked, so we have to be careful with the selectors.

  var $points    = $(".subtext .score", row2),
      $comments  = $(".subtext a:last-of-type", row2),
      $submitter = $(".subtext a:first-of-type", row2),
      submitted = $(".subtext", row2).text().trim();

  if ($points.length > 0 && $comments.length > 0 && $submitter.length > 0) {
    story.points    = toInt( $points.text() );
    story.submitter = $submitter.text().trim();
    story.submitted = extractSubmitted( submitted );
    story.commentsCount = toInt( $comments.text() );
  } else {
    story.tag = "Job";
    story.submitted = extractSubmitted( submitted );
  }

  // Discussion threads like Ask HN has a body of text attached to them. We can
  // only get that if we are on the item page (as opposed to the index pages).
  //
  // The markup is a little strange, something like this:
  //
  //   <td>
  //     Hello!
  //     <p>Another line.</p>
  //     <p>Moar lines.</p>
  //   </td>
  //

  if (row3) {
    story.body = extractBody( $(row3).find("td:has(p)").contents() );
  }

  // Obviously we will only have this if we are on the item page.

  if (story.commentsCount !== null && commentRows) {
    comments = extractComments(story, commentRows);
  }

  return [story, comments];
}

export function extractSingle(doc) {
  var rows = $("#hnmain table:eq(1) tr", doc);
  var commentRows = $("#hnmain table:eq(2) table", doc);

  var [story, comments] = extractStory( rows[0], rows[1], rows[3], commentRows );

  return { story, comments };
}

export function extractArray(doc) {
  var meta = {},
      stories = [],
      payload = { meta, stories };

  try {
    meta.next = $("#hnmain tr:last-child a:contains(More)", doc).attr("href").split(/=|&/)[1];
  } catch(e) {
    meta.next = null;
  }

  var rows = toArray( $("#hnmain table:eq(1) tr:has(.title):not(:last-child)", doc) );

  rows.forEach( row => {
    stories.push( extractStory(row, row.nextElementSibling)[0] );
  });

  return payload;
}

export function isError(doc) {
  return $("#hnmain table:eq(1) tr", doc).length === 0;
}

export function parentID(doc) {
  return extractID( $("#hnmain table:eq(1) tr .comhead a:contains(parent)", doc).attr("href") );
}
