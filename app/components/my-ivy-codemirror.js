import IvyCodemirrorComponent from 'ivy-codemirror/components/ivy-codemirror';
import Ember from 'ember';

let { get, set, isPresent } = Ember;

export default IvyCodemirrorComponent.extend({
  _hoverListener: null,
  markerErrors: {},

  didInsertElement(...args) {
    this._super(args);

    let codeMirror = this._codeMirror;
    codeMirror.getWrapperElement().onmousedown = (e) => {
      let lineCh = codeMirror.coordsChar({ left: e.clientX, top: e.clientY });
      let markers = codeMirror.findMarksAt(lineCh);
      debugger;
      if (markers.length === 0) {
        this.highlightError([]);
      } else {
        let errorLines = markers.map((marker) => {
          return get(this, `markerErrors.${marker.id}`);
        });

        this.highlightError(errorLines);
      }
    };
  },

  didUpdateAttrs() {
    this._super(...arguments);

    let codeMirror = this._codeMirror;

    let errorLines = get(this, 'errorLines');
    if (get(this, 'hoveringOnError')) {
      let lineNumString = get(this, 'highlightLine');
      let lineNum = parseInt(lineNumString);
      codeMirror.markText({ line: lineNum - 1, ch: 0 }, { line: lineNum, ch: 0 }, { className: "hover-highlight" });
    } else if (isPresent(errorLines)) {
      let markers = codeMirror.getAllMarks();
      markers.forEach((marker) =>  marker.clear());

      let markerErrors = get(this, 'markerErrors');
      errorLines.forEach((errorLine) => {
        let lineText = codeMirror.lineInfo(errorLine - 1).text;
        let marker = codeMirror.markText({ line: errorLine - 1, ch: 0 }, { line: errorLine -1, ch: lineText.length - 1}, { handleMouseEvents: true, className: "basic-highlight" });
        set(markerErrors, `${marker.id}`,  errorLine);
      });
    }
  }
});
