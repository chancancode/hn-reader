import Ember from "ember";
import Server from "../../helpers/hacker-news-server";
import fixtures from "../../fixtures";
import {
  moduleForModel,
  test
} from 'ember-qunit';

var server;

moduleForModel('story', 'Story', {
  needs: ['adapter:story', 'serializer:story'],

  setup() { server = new Server(); },

  teardown() { server.shutdown(); }
});

function itemsDeepEqual(actual, expected) {
  actual = actual.map(
    item => ({ title: item.get('title'), url: item.get('url') })
  );

  expected = expected.map(
    item => ({ title: item.title, url: item.url })
  );

  deepEqual(actual, expected);
}

test('finding the front page stories', function() {
  var page = fixtures.news['1.json'];

  return Ember.RSVP.all([
    this.store().find('story', { filter: 'front-page' }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    }),

    this.store().find('story', { filter: 'front-page', page: 1 }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    })
  ]);
});

test('finding the front page stories (page 2)', function() {
  var page = fixtures.news['2.json'];

  return this.store().find('story', { filter: 'front-page', page: 2 }).then( result => {
    itemsDeepEqual(result, page.stories);
    equal(result.meta.next, page.meta.next);
  });
});

test('finding the latest stories', function() {
  var page = fixtures.newest['newest.json'];

  return Ember.RSVP.all([
    this.store().find('story').then( result => {
      itemsDeepEqual(result, page.stories);
    }),

    this.store().find('story', {}).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    }),

    this.store().find('story', { filter: 'latest' }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    })
  ]);
});

test('finding the latest stories (page 2)', function() {
  var page = fixtures.newest['8680227.json'];

  return Ember.RSVP.all([
    this.store().find('story', { page: '8680227'}).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    }),

    this.store().find('story', { filter: 'latest', page: '8680227'}).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    })
  ]);
});

test('finding the "Show HN" stories', function() {
  var page = fixtures.show['1.json'];

  return Ember.RSVP.all([
    this.store().find('story', { filter: 'show-hn' }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    }),

    this.store().find('story', { filter: 'show-hn', page: 1 }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    })
  ]);
});

test('finding the "Show HN" stories (page 2/last page)', function() {
  var page = fixtures.show['2.json'];

  return this.store().find('story', { filter: 'show-hn', page: 2 }).then( result => {
    itemsDeepEqual(result, page.stories);
    strictEqual(result.meta.next, null);
  });
});

test('finding the "Ask HN" stories', function() {
  var page = fixtures.ask['1.json'];

  return Ember.RSVP.all([
    this.store().find('story', { filter: 'ask-hn' }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    }),

    this.store().find('story', { filter: 'ask-hn', page: 1 }).then( result => {
      itemsDeepEqual(result, page.stories);
      equal(result.meta.next, page.meta.next);
    })
  ]);
});

test('finding the "Ask HN" stories (page 2)', function() {
  var page = fixtures.ask['2.json'];

  return this.store().find('story', { filter: 'ask-hn', page: 2 }).then( result => {
    itemsDeepEqual(result, page.stories);
    equal(result.meta.next, page.meta.next);
  });
});

test('finding the "Ask HN" stories (last page)', function() {
  var page = fixtures.ask['5.json'];

  return this.store().find('story', { filter: 'ask-hn', page: 5 }).then( result => {
    itemsDeepEqual(result, page.stories);
    strictEqual(result.meta.next, null);
  });
});


test('finding the jobs stories (first/last page)', function() {
  var page = fixtures.jobs['1.json'];

  return Ember.RSVP.all([
    this.store().find('story', { filter: 'jobs' }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, null);
    }),

    this.store().find('story', { filter: 'jobs', page: 1 }).then( result => {
      itemsDeepEqual(result, page.stories);
      strictEqual(result.meta.next, null);
    })
  ]);
});

test('finding an non-existent page', function() {
  return this.store().find('story', { filter: 'show-hn', page: 99 })
    .then( () => ok(false, "This should not pass"), reason => equal(reason, "Not found") );
});
