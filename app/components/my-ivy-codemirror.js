import IvyCodemirrorComponent from 'ivy-codemirror/components/ivy-codemirror';
import Ember from 'ember';

let { get, isPresent } = Ember;

export default IvyCodemirrorComponent.extend({
  didUpdateAttrs() {
    this._super(...arguments);
    debugger;

    let codeMirror = this._codeMirror;
    if (get(this, 'shouldHighlightLine')) {
      let lineNumString = get(this, 'highlightLine');
      let lineNum = parseInt(lineNumString);
      codeMirror.markText({ line: lineNum, ch: 0 }, { line: lineNum + 1, ch: 0}, {css: "background-color: #F6A623"});
    } else {
      let markers = codeMirror.getAllMarks();
      markers.forEach(marker => marker.clear());
    }
  }
});
