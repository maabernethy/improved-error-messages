import Ember from 'ember';

let { get } = Ember;

export default Ember.Service.extend({
  ids: null,

  init() {
    this._super(...arguments);
    this.set('ids', []);
  },

  addId(id) {
    get(this, 'ids').push(id);
  },

  getIds() {
    return get(this, 'ids');
  }
});
