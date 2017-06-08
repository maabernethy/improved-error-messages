import Ember from 'ember';

let { get, set } = Ember;

export default Ember.Component.extend({
  didReceiveAttrs(...args) {
    this._super(args);

    this.generateReturnTypeCode();
    this.generateVoidReturnCode();
  },

  firstMessage: 'Your function must return the correct type of variable. Or you must specify `void` in the function header',
  secondMessage: '<b>Note</b>: if you think you are returning properly, try fixing other errors first. This error often occurs as a consequence of another syntax error.',

  types: ['void', 'int', 'double', 'float', 'char'],

  generateVoidReturnCode() {
    let source = get(this, 'source');
    let sourceArray = source.split("\n");
    let type = sourceArray[0].trim().split(" ")[0];

    if (get(this, 'types').includes(type)) {
      let commentLine = '    // ...';
      let voidString = 'void';
      let firstLineArray = sourceArray[0].split(" ");
      firstLineArray[0] = voidString;
      let voidCode = [firstLineArray.join(" "), commentLine, "}"];

      set(this, 'voidCode', voidCode.join("\n"));
    } else {
      // you must specify a type in the fuction header
      // code to do that
    }
  },

  generateReturnTypeCode() {
    let source = get(this, 'source');
    let sourceArray = source.split("\n");
    let type = sourceArray[0].trim().split(" ")[0];

    if (get(this, 'types').includes(type)) {
      if (type === 'void') {
        type = 'int';
        let firstLineArray = sourceArray[0].split(" ");
        firstLineArray[0] = type;
        sourceArray[0] = firstLineArray.join(" ");
      }

      let newLine = `    return an${type.capitalize()}Variable`;
      let commentLine = '    // ...';
      let typeCode = [sourceArray[0], commentLine, newLine, "}"];

      set(this, 'typeCode', typeCode.join("\n"));
    } else {
      // you must specify a type in the fuction header
      // code to do that
    }
  }
});
