import Ember from 'ember';

let { get, set } = Ember;

export default Ember.Component.extend({
  ajax: Ember.inject.service(),

  showCorrectCode: false,

  didReceiveAttrs(...args) {
    this._super(args);

    this.testUpdatedCode();
  },

  testUpdatedCode() {
    let source = get(this, 'source');
    let lineNumber = get(this, 'error.line');
    let sourceArray = source.split("\n");
    sourceArray[lineNumber-2] = `${sourceArray[lineNumber-2]};`;
    let updatedSource = sourceArray.join("\n");

    this.get('ajax').compilerRequest(updatedSource)
    .then((response) => {
      this.processReturnResult(response, updatedSource);
    }).catch((error) => {
      this.handleError(error);
    });
  },

  processReturnResult(response, updatedSource) {
    let { result: result, errorMessage: errorMessage, stdout: stdout, stderr: stderr } = this.get('ajax').processOutcome(response);
    if (this.get('ajax').noCompileErrors(errorMessage)) {
      set(this, 'showCorrectCode', true);
      set(this, 'correctCode', updatedSource);
    }
  }
});
