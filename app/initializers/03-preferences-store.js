import Ember from 'ember';

// Lifted from https://medium.com/the-ember-way/metaprogramming-in-emberjs-627921395299

function expandKey(namespace, key) {
  return `${namespace}:${key}`;
}

function serialize(value) {
  return JSON.stringify(value);
}

function deserialize(value) {
  return JSON.parse(value);
}

export const StorageAdapter = Ember.Object.extend({
  store: window.localStorage,
  namespace: 'hn-reader',
  _cache: null,

  // Lazily initialize this to an empty POJO if not provided
  defaults: function() { return {}; }.property(),

  init() {
    this.set('_cache', {});
    Ember.$(window).on(`storage.${ Ember.guidFor(this) }`, Ember.run.bind(this, '_onStorageEvent'));
  },

  unknownProperty(key) {
    var { store, namespace, _cache, defaults } =
      this.getProperties('store', 'namespace', '_cache', 'defaults');

    if (_cache.hasOwnProperty(key)) {
      return _cache[key];
    }

    var value = store.getItem( expandKey(namespace, key) );

    if (value === null) {
      if (defaults.hasOwnProperty(key)) {
        value = deserialize(serialize( defaults[key] ));
        _cache[key] = value;
      } else {
        value = undefined;
        _cache[key] = undefined;
      }
    } else {
      value = deserialize(value);
      _cache[key] = value;
    }

    return value;
  },

  setUnknownProperty(key, value) {
    this._update(key, value);
    return true;
  },

  _update(key, value, flush = true) {
    var { store, namespace, _cache } =
      this.getProperties('store', 'namespace', '_cache');

    this.propertyWillChange(key);

    if (value === undefined) {
      if (flush) {
        store.removeItem( expandKey(namespace, key) );
      }

      value = undefined;
      _cache[key] = undefined;
    } else {
      if (flush) {
        store.setItem( expandKey(namespace, key), serialize(value) );
      }

      value = deserialize(serialize(value));
      _cache[key] = value;
    }

    this.propertyDidChange(key);
  },

  _clear() {
    var cache = this.get('_cache');

    this.beginPropertyChanges();

    for (let key in cache) {
      this.notifyPropertyChange(key);
      delete cache[key];
    }

    this.endPropertyChanges();
  },

  _onStorageEvent(e) {
    var { store, namespace } = this.getProperties('store', 'namespace');

    if (e.originalEvent && e.originalEvent.storageArea === store) {
      let { key, newValue } = e.originalEvent;

      if (key && key.indexOf(namespace) === 0) {
        this._update( key.substr(namespace.length + 1), newValue === null ? undefined : deserialize(newValue) );
      } else if (key === null) {
        this._clear();
      }
    }
  },

  willDestroy() {
    Ember.$(window).off(`storage.${ Ember.guidFor(this) }`);
  }
});

export const DefaultPreferences = {

  // Automatic Comments Folding
  autoFold: true,
  autoFoldDepth: 3,

};

export function initialize(container, application) {

  var PreferencesStore = StorageAdapter.create({ defaults: DefaultPreferences });

  application.register('preferences:main', PreferencesStore, { instantiate: false });

  application.inject('route', 'preferences', 'preferences:main');
  application.inject('controller', 'preferences', 'preferences:main');
  application.inject('component', 'preferences', 'preferences:main');

}

export default {
  name: '03-preferences-store',
  initialize: initialize
};
