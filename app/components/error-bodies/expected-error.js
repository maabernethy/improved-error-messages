import Ember from 'ember';

let { get, set } = Ember;

export default Ember.Component.extend({
  didReceiveAttrs(...args) {
    this._super(args);

    set(this, 'errorDetails', this.getErrorDetails());
  },

  getErrorDetails() {
    let entireError = get(this, 'error.entireError');
    let errorArray = entireError.split("\n");
    errorArray.shift();
    return errorArray.join("\n");
  }
});
