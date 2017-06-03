import Ember from 'ember';

let { get, set, computed } = Ember;

export default Ember.Component.extend({
  ajax: Ember.inject.service(),

  showCorrectCode: false,

  didReceiveAttrs(...args) {
    this._super(args);

    this.testUpdatedCode();
  },

  lineNumber: computed('error.line', function() {
    return get(this, 'error.line') - 1;
  }),

  testUpdatedCode() {
    let source = get(this, 'source');
    let lineNumber = get(this, 'error.line');
    let sourceArray = source.split("\n");
    let updatedLine = `${sourceArray[lineNumber-2]};`;
    sourceArray[lineNumber-2] = updatedLine;
    let updatedSource = sourceArray.join("\n");

    this.get('ajax').compilerRequest(updatedSource)
    .then((response) => {
      this.processReturnResult(response, updatedLine);
    }).catch((error) => {
      this.handleError(error);
    });
  },

  processReturnResult(response, updatedLine) {
    let { result: result, errorMessage: errorMessage, stdout: stdout, stderr: stderr } = this.get('ajax').processOutcome(response);
    if (this.get('ajax').noCompileErrors(errorMessage)) {
      set(this, 'showCorrectCode', true);
      set(this, 'correctCode', updatedLine);
    }
  }
});
