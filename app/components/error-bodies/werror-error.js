import Ember from 'ember';

let { get, set, isEmpty } = Ember;

export default Ember.Component.extend({
  didReceiveAttrs(...args) {
    this._super(args);

    let isMissingFunctionType = this.missingFunctionType();
    let isMissingParamType = this.missingParamType();

    if (isMissingFunctionType && isMissingParamType) {
      set(this, 'isAllCode', true);
      this.generateAllCode();
    } else if (isMissingFunctionType) {
      set(this, 'isFunctionCode', true);
      this.generateFunctionTypeCode();
    } else if (isMissingParamType) {
      this.generateParamTypeCode();
    } else {
      this.generateAllCode();
    }
  },

  missingFunctionType() {
    let sourceArray = get(this, 'source').split("\n");
    let type = sourceArray[0].split(" ")[0];

    return !get(this, 'types').includes(type);
  },

  missingParamType() {
    let sourceArray = get(this, 'source').split("\n");
    let regex = /\( *([^)]+?) *\)/g;
    let params = regex.exec(sourceArray[0]);
    let paramsArray = params[1].split(",");

    let paramsWithType = paramsArray.filter((param) => {
      let temp = param.trim().split(" ");
      if (temp.length == 2) {
        return get(this, 'types').includes(temp[0]);
      } else {
        return false;
      };
    });

    return isEmpty(paramsWithType);
  },

  firstMessageFunction: 'You must specify a return type for your function:',
  secondMessageFunction: 'Replace TYPE with <b>void</b> (if not returning anything), <b>int</b>, <b>float</b>, <b>double</b>, or <b>char</b>',
  firstMessageParam: 'You must specify a type for each parameter:',
  secondMessageParam: 'Replace TYPE with <b>int</b>, <b>float</b>, <b>double</b>, or <b>char</b>',
  firstMessageAll: 'Make sure you have specified a type for your function and your function Parameters',
  tipAll: '<b>TIP</b>: Make sure there is a space between the type and param or function name',

  types: ['void', 'int', 'double', 'float', 'char'],

  generateAllCode() {
    let functionTypeCode = this.generateFunctionTypeCode().split("\n");
    let firstLineFunction = functionTypeCode[0];
    let firstLineParam = this.generateParamTypeCode().split("\n")[0];

    debugger;
    let firstLineArray = [firstLineFunction.split("(")[0], firstLineParam.split("(")[1]];
    let code = [firstLineArray.join("("), functionTypeCode[1], functionTypeCode[2]].join("\n");
    set(this, 'allCode', code);
  },

  generateFunctionTypeCode() {
    let sourceArray = get(this, 'source').split("\n");
    let type = 'TYPE';
    let newLine = `${type} ${sourceArray[0].trim()}`;
    let commentLine = '    // ...';
    let functionTypeCode = [newLine, commentLine, "}"].join("\n");

    set(this, 'functionTypeCode', functionTypeCode);
    return functionTypeCode;
  },

  generateParamTypeCode() {
    let sourceArray = get(this, 'source').split("\n");
    let type = 'TYPE';
    let firstLineArray = sourceArray[0].split("(");
    let tempArray = [];
    if (firstLineArray[1].indexOf(",") > -1) {
      let params = firstLineArray[1].split(",");
      params.forEach((param) => tempArray.push(`${type} ${param}`));
      firstLineArray[1] = tempArray.join(",");
    } else {
      tempArray.push(`${type} ${firstLineArray[1]}`);
      firstLineArray[1] = tempArray;
    }

    let newLine = firstLineArray.join("(");
    let commentLine = '    // ...';
    let paramTypeCode = [newLine, commentLine, "}"].join("\n");

    set(this, 'paramTypeCode', paramTypeCode);
    return paramTypeCode;
  }
});
