import IvyCodemirrorComponent from 'ivy-codemirror/components/ivy-codemirror';
import Ember from 'ember';

let { get, set, isPresent } = Ember;

export default IvyCodemirrorComponent.extend({
  manageIds: Ember.inject.service('manage-ids'),

  _hoverListener: null,
  markerErrors: {},

  didInsertElement(...args) {
    this._super(args);

    this.get('manageIds').addId(this.get('elementId'));

    let codeMirror = this._codeMirror;

    if (get(this, 'codeSnippet')) {
      $('.collapsible-body .CodeMirror').addClass('code-snippet');
    } else {
      codeMirror.getWrapperElement().onmousedown = (e) => {
        let lineCh = codeMirror.coordsChar({ left: e.clientX, top: e.clientY });
        let markers = codeMirror.findMarksAt(lineCh);
        if (markers.length === 0 || isPresent(lineCh.outside)) {
          this.highlightError([]);
        } else {
          let errorLines = markers.map((marker) => {
            return get(this, `markerErrors.${marker.id}`);
          });

          this.highlightError(errorLines);
        }
      };
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    let codeMirror = this._codeMirror;

    if (get(this, 'codeSnippet')) {
    } else {
      let errorLines = get(this, 'errorLines');
      if (get(this, 'hoveringOnError')) {
        let lineNumString = get(this, 'highlightLine');
        let lineNum = parseInt(lineNumString);
        let lineText = codeMirror.lineInfo(lineNum - 1).text;
        codeMirror.markText({ line: lineNum - 1, ch: 0 }, { line: lineNum - 1, ch: lineText.length }, { className: "hover-highlight" });
      } else if (isPresent(errorLines)) {
        let markers = codeMirror.getAllMarks();
        markers.forEach((marker) =>  marker.clear());

        let markerErrors = get(this, 'markerErrors');
        errorLines.forEach((errorLine) => {
          let lineText = codeMirror.lineInfo(errorLine - 1).text;
          let marker = codeMirror.markText({ line: errorLine - 1, ch: 0 }, { line: errorLine -1, ch: lineText.length }, { handleMouseEvents: true, className: "basic-highlight" });
          set(markerErrors, `${marker.id}`,  errorLine);
        });
      }
    }
  }
});
