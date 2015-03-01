import Ember from 'ember';

function toLogicalPath(realPath) {
  var match;

  if ( realPath.indexOf('/news') === 0 ) {
    return '/stories';
  }

  if ( realPath.indexOf('/newest') === 0 ) {
    return '/stories?filter=latest';
  }

  if ( realPath.indexOf('/active') === 0 ) {
    return '/stories?filter=active';
  }

  if ( realPath.indexOf('/show') === 0 ) {
    return '/stories?filter=show-hn';
  }

  if ( realPath.indexOf('/ask') === 0 ) {
    return '/stories?filter=ask-hn';
  }

  if ( realPath.indexOf('/jobs') === 0 ) {
    return '/stories?filter=jobs';
  }

  if ( realPath.indexOf('/item') === 0 && (match = /id=(\d+)/.exec(realPath)) ) {
    return `/stories/${ match[1] }`;
  }

  if ( realPath.indexOf('?preferences') >= 0 ) {
    return '/preferences';
  }

  if ( realPath.indexOf('?about') >= 0 ) {
    return '/about';
  }

  return realPath;
}

function fromLogicalPath(logicalPath) {
  var match;

  if ( match = /\/user\/(.+)/.exec(logicalPath) ) {
    return `/user?id=${ match[1] }`;
  }

  if ( match = /\/stories\/.+highlight=(\d+)/.exec(logicalPath) ) {
    return `/item?id=${ match[1] }`;
  }

  if ( match = /\/stories\/(\d+)/.exec(logicalPath) ) {
    return `/item?id=${ match[1] }`;
  }

  if ( match = /\/stories\/job-(\d+)/.exec(logicalPath) ) {
    return '/jobs';
  }

  if ( match = /\/stories\/?\?(?:.+\&)?filter=([^&]+)/.exec(logicalPath) ) {
    switch(match[1]) {
      case 'latest':
        return '/newest';

      case 'active':
        return '/active';

      case 'show-hn':
        return '/show';

      case 'ask-hn':
        return '/ask';

      case 'jobs':
        return '/jobs';
    }
  }

  if (logicalPath.indexOf('/stories') === 0 ) {
    return '/news';
  }

  if (logicalPath.indexOf('/preferences') === 0 ) {
    return '/?preferences';
  }

  if (logicalPath.indexOf('/about') === 0 ) {
    return '/?about';
  }

  return '/';
}

export const MappedLocation = Ember.HistoryLocation.extend({
  implementation: 'mapped',

  getURL() {
    var state = this.getState();
    return (state && state.logicalPath) || toLogicalPath(this._super());
  },

  setURL(logicalPath) {
    var state = this.getState();

    if (!state || state.logicalPath !== logicalPath) {
      this.pushState(this.formatURL(logicalPath), logicalPath);
    }
  },

  replaceURL(logicalPath) {
    var state = this.getState();

    if (!state || state.logicalPath !== logicalPath) {
      this.replaceState(this.formatURL(logicalPath), logicalPath);
    }
  },

  pushState(realPath, logicalPath) {
    var state = { realPath, logicalPath };

    this.get('history').pushState(state, null, realPath);

    this._historyState = state;
    this._previousURL = this.getURL();
  },

  replaceState(realPath, logicalPath) {
    var state = { realPath, logicalPath };

    this.get('history').replaceState(state, null, realPath);

    this._historyState = state;
    this._previousURL = this.getURL();
  },

  formatURL(logicalPath) {
    return this._super(fromLogicalPath(logicalPath));
  }
});

export function initialize(container) {
  container.register('location:mapped', MappedLocation);
}

export default {
  name: '04-url-mapper',
  initialize: initialize
};
