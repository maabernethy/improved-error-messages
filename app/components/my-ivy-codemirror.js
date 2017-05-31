import IvyCodemirrorComponent from 'ivy-codemirror/components/ivy-codemirror';
import Ember from 'ember';

let { get, isPresent } = Ember;

export default IvyCodemirrorComponent.extend({
  didUpdateAttrs() {
    this._super(...arguments);

    let codeMirror = this._codeMirror;

    let errorLines = get(this, 'errorLines');
    if (get(this, 'hoveringOnError')) {
      let lineNumString = get(this, 'highlightLine');
      let lineNum = parseInt(lineNumString);
      codeMirror.markText({ line: lineNum - 1, ch: 0 }, { line: lineNum, ch: 0}, { className: "hover-highlight" });
    } else if (isPresent(errorLines)) {
      let markers = codeMirror.getAllMarks();
      markers.forEach(marker => marker.clear());
      errorLines.forEach((errorLine) => {
        codeMirror.markText({ line: errorLine - 1, ch: 0 }, { line: errorLine, ch: 0}, { className: "basic-highlight" });
      });
    }
  }
});
