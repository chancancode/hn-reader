import Ember from 'ember';
import { initialize } from '../../../initializers/04-url-mapper';
import { module, test } from 'qunit';

var container, application;

module('04UrlMapperInitializer', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      container = application.__container__;
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('location:mapped registered on initialize', function(assert) {
  initialize(container, application);

  assert.equal(container.resolve('location:mapped'), '(subclass of Ember.HistoryLocation)');
});
