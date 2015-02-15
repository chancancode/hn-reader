import Ember from "ember";
import Server from "../../helpers/hacker-news-server";
import fixtures from "../../fixtures";
import { resetGuid } from "hn-reader/extractors/story";
import {
  moduleForModel,
  test
} from 'ember-qunit';

var server;

moduleForModel('story', 'Story', {
  needs: ['adapter:story', 'serializer:story'],

  setup() {
    resetGuid();
    server = new Server();
  },

  teardown() {
    server.shutdown();
  }
});

function itemsDeepEqual(actual, expected) {
  actual = actual.map( item => item.toJSON({ includeId: true }) );
  deepEqual(actual, expected);
}

function findSingle(id) {
  var item = fixtures.item[`${id}.json`];

  test(`finding a single story (ID=${id})`, function() {
    var promise = Ember.run( () => this.store().find('story', id) );

    return promise.then( result => {
      deepEqual(result.toJSON({ includeId: true }), item.story);
    });
  });
}

for (let item in fixtures.item) {
  if (item.indexOf('.json') > 0) {
    findSingle( item.replace('.json', '') );
  }
}

test('finding the latest front page stories', function() {
  var page = fixtures.news['1.json'];

  return this.store().find('story', { filter: 'front-page' }).then( result => {
    itemsDeepEqual(result, page.stories);
    strictEqual(result.meta.next, page.meta.next);
  });
});

function findFrontPage(p) {
  var page = fixtures.news[`${p}.json`];

  test(`finding front page stories (page ${p})`, function() {
    return this.store().find('story', { filter: 'front-page', page: parseInt(p, 10) }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, page.meta.next);
    });
  });
}

for (let page in fixtures.news) {
  if (page.indexOf('.json') > 0) {
    findFrontPage(page.replace('.json', ''));
  }
}

test('finding the latest stories', function() {
  var page = fixtures.newest['newest.json'];

  return Ember.RSVP.all([
    this.store().find('story').then( result => {
      itemsDeepEqual(result, page.stories);
    }),

    this.store().find('story', {}).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, page.meta.next);
    }),

    this.store().find('story', { filter: 'latest' }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, page.meta.next);
    })
  ]);
});

function findLatest(since) {
  var page = fixtures.newest[`${since}.json`];

  test(`finding the latest stories (since ${since})`, function() {
    return Ember.RSVP.all([
      this.store().find('story', { page: since}).then( result => {
        itemsDeepEqual(result, page.stories);
        strictEqual(result.meta.next, page.meta.next);
      }),

      this.store().find('story', { filter: 'latest', page: since}).then( result => {
        itemsDeepEqual(result, page.stories);
        strictEqual(result.meta.next, page.meta.next);
      })
    ]);
  });
}

for (let page in fixtures.newest) {
  if (page !== 'newest.json' && page.indexOf('.json') > 0) {
    findLatest(page.replace('.json', ''));
  }
}

test('finding the latest "Show HN" stories', function() {
  var page = fixtures.show['1.json'];

  return this.store().find('story', { filter: 'show-hn' }).then( result => {
    itemsDeepEqual(result, page.stories);
    strictEqual(result.meta.next, page.meta.next);
  });
});

function findShow(p) {
  var page = fixtures.show[`${p}.json`];

  test(`finding "Show HN" stories (page ${p})`, function() {
    return this.store().find('story', { filter: 'show-hn', page: p }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, page.meta.next);
    });
  });
}

for (let page in fixtures.show) {
  if (page.indexOf('.json') > 0) {
    findShow(page.replace('.json', ''));
  }
}

test('finding the latest "Ask HN" stories', function() {
  var page = fixtures.show['1.json'];

  return this.store().find('story', { filter: 'show-hn' }).then( result => {
    itemsDeepEqual(result, page.stories);
    strictEqual(result.meta.next, page.meta.next);
  });
});

function findAsk(p) {
  var page = fixtures.ask[`${p}.json`];

  test(`finding "Ask HN" stories (page ${p})`, function() {
    return this.store().find('story', { filter: 'ask-hn', page: p }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, page.meta.next);
    });
  });
}

for (let page in fixtures.ask) {
  if (page.indexOf('.json') > 0) {
    findAsk(page.replace('.json', ''));
  }
}

test('finding the latest jobs', function() {
  var page = fixtures.jobs['1.json'];

  return this.store().find('story', { filter: 'jobs' }).then( result => {
    itemsDeepEqual(result, page.stories);
    strictEqual(result.meta.next, page.meta.next);
  });
});

function findJobs(p) {
  var page = fixtures.jobs[`${p}.json`];

  test(`finding jobs (page ${p})`, function() {
    return this.store().find('story', { filter: 'jobs', page: p }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, page.meta.next);
    });
  });
}

for (let page in fixtures.jobs) {
  if (page.indexOf('.json') > 0) {
    findJobs(page.replace('.json', ''));
  }
}

test('finding an non-existent page', function() {
  return this.store().find('story', { filter: 'show-hn', page: 99 })
    .then( () => ok(false, "This should not pass"), reason => equal(reason, "Not found") );
});
