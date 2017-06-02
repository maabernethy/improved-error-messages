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
    sourceArray.push('}');
    let updatedSource = sourceArray.join("\n");
    let sourceToShowArray = [sourceArray[0], "    // your code", "}"];

    this.get('ajax').compilerRequest(updatedSource)
    .then((response) => {
      this.processReturnResult(response, sourceToShowArray.join("\n"));
    }).catch((error) => {
      this.handleError(error);
    });
  },

  processReturnResult(response, sourceToShow) {
    let { result: result, errorMessage: errorMessage, stdout: stdout, stderr: stderr } = this.get('ajax').processOutcome(response);
    if (this.get('ajax').lessNumberOfErrors(errorMessage)) {
      set(this, 'showCorrectCode', true);
      set(this, 'correctCode', sourceToShow);
    }
  }
});
