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
    let type = sourceArray[0].split(" ")[0];
    let updatedLine = `${type} ${sourceArray[lineNumber-1].trim()}`;
    sourceArray[lineNumber-1] = updatedLine;
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
    if (this.get('ajax').lessNumberOfErrors(errorMessage)) {
      set(this, 'showCorrectCode', true);
      set(this, 'correctCode', updatedLine);
    } else {
      let type = 'TYPE';
      let lineArray = updatedLine.split(" ");
      lineArray[0] = type;

      set(this, 'exampleLine', lineArray.join(" "));
    }
  }
});
