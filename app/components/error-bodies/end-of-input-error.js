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
    let sourceArray = source.split("\n");
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
    let { errorMessage: errorMessage } = this.get('ajax').processOutcome(response);
    if (this.get('ajax').lessNumberOfErrors(errorMessage)) {
      set(this, 'showCorrectCode', true);
      set(this, 'correctCode', sourceToShow);
    }
  }
});
