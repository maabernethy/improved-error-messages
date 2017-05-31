import MdCollapsibleComponent from 'ember-cli-materialize/components/md-collapsible';
import layout from '../templates/components/my-md-collapsible';

export default MdCollapsibleComponent.extend({
  classNameBindings: ['getClassNames'],
  getClassNames: Ember.computed('forceHover', function(){
    if (this.get('forceHover')) {
      return "force-hover";
    } else {
      return "";
    };
  }),

  layout,
  mouseEnter() {
    this.get('mouseOverAction')(this.get('errorLineNumber'));
  },

  mouseLeave() {
    this.get('mouseLeaveAction')();
  }
});
