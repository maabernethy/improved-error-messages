import MdCollapsibleComponent from 'ember-cli-materialize/components/md-collapsible';

export default MdCollapsibleComponent.extend({
  mouseEnter() {
    this.get('mouseOverAction')(this.get('errorLineNumber'));
  },

  mouseLeave() {
    this.get('mouseLeaveAction')();
  }
});
