import Ember from 'ember';
import MdCollapsibleComponent from 'ember-cli-materialize/components/md-collapsible';
import layout from '../templates/components/my-md-collapsible';

let { isPresent } = Ember;

export default MdCollapsibleComponent.extend({
  codeMirror: Ember.inject.service(),
  manageIds: Ember.inject.service('manage-ids'),

  click() {
    let codeMirrorIds = this.get('manageIds').getIds();
    let instances = [];
    codeMirrorIds.forEach((id) => {
      instances.push(this.get('codeMirror').instanceFor(id));
    });

    instances.forEach((instance) => {
      if (isPresent(instance)) {
        instance.refresh();
      }
    });
  },

  classNameBindings: ['getClassNames'],
  getClassNames: Ember.computed('forceHover', function(){
    if (this.get('forceHover')) {
      return "force-hover";
    } else {
      return "";
    }
  }),

  layout,
  mouseEnter() {
    this.get('mouseOverAction')(this.get('errorLineNumber'));
  },

  mouseLeave() {
    this.get('mouseLeaveAction')();
  }
});
