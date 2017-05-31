import MdCollapsibleComponent from 'ember-cli-materialize/components/md-collapsible';
import layout from '../templates/components/my-md-collapsible';

export default MdCollapsibleComponent.extend({
  layout,
  mouseEnter() {
    this.get('mouseOverAction')(this.get('errorLineNumber'));
  },

  mouseLeave() {
    this.get('mouseLeaveAction')();
  }
});
