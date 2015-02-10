import Ember from 'ember';

function inside(element, target) {
  return element === target || Ember.$.contains(element, target);
}

function outside(element, target) {
  return ! inside(element, target);
}

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['nav-menu'],
  classNameBindings: ['expanded'],

  expanded: false,

  click() {
    this.toggleProperty('expanded');
  },

  dismiss() {
    this.set('expanded', false);
  },

  didInsertElement() {
    Ember.$('body').on(`click.${Ember.guidFor(this)}`, e => {
      if (outside(this.element, e.target)) {
        this.dismiss();
      }
    });
  },

  willDestroyElement() {
    Ember.$('body').off(`click.${Ember.guidFor(this)}`);
  }
});
