import Ember from 'ember';

let {
  get,
  set,
  computed,
  isPresent,
  isEmpty,
  String: { camelize }
} = Ember;

const RETURN_TYPE = 'ReturnType';
const UNDECLARED = 'Undeclared';
const END_OF_INPUT = 'EndOfInput';
const EXPECTED = 'Expected';
const WERROR = 'Werror';
const EXPECTED_SEMICOLON = 'ExpectedSemicolon';
const EXPECTED_IDENTIFIER = 'ExpectedIdentifier';
const ALREADY_DECLARED = 'AlreadyDeclared';
const OTHER = 'Other';

const ERROR_REGEX = [
  { type: RETURN_TYPE, regex:  /\bWerror=return-type\b/g },
  { type: UNDECLARED, regex: /\bundeclared\b/g },
  { type: END_OF_INPUT, regex: /\bexpected declaration or statement at end of input\b/g },
  { type: EXPECTED_IDENTIFIER,  regex: /expected identifier or '[(]'/g },
  { type: EXPECTED_SEMICOLON, regex: /expected '(;)'/g },
  { type: EXPECTED, regex: /\bexpected\b/g },
  { type: WERROR, regex: /\bWerror\b/g },
  { type: ALREADY_DECLARED, regex: /\bnote\b/g }
]

const ERROR_INFO = {
  returnType(shortError) {
    let title = 'Missing return statement';
    let component = 'return-type-error';
    return { title, component };
  },

  undeclared(shortError, source) {
    let shortErrorArray = shortError.split("'");
    let title = `Missing type when using '${shortErrorArray[0]}' for the first time`;
    let component = 'undeclared-error';
    return { title, component };
  },

  endOfInput(shortError) {
    let title = 'Missing or extra “;” “}” “)” on or anywhere above this line';
    let component = 'end-of-input-error';
    return { title, component };
  },

  expected(shortError) {
    let title = shortError.split("error:").join();
    let component = 'expected-error';
    return { title, component };
  },

  werror(shortError) {
    let title = 'Missing type for your function or function parameters';
    let component = 'werror-error';
    return { title, component };
  },

  expectedSemicolon(shortError, source, lineNumber) {
    let title = 'Missing a semicolon to end the line';
    let component = 'expected-semicolon-error';
    return { title, component };
  },

  expectedIdentifier(shortError) {
    let title = "Missing or extra ';' '}' ')' somewhere on or above this line";
    let component = 'expected-identifier-error';
    return { title, component };
  },

  alreadyDeclared(shortError) {
    let title = "note: previous definition of 'array' was here";
    let component = 'already-declared-error';
    return { title, component };
  },

  other(shortError) {
    let title = shortError.split("error:").join();
    let component = 'other-error';
    return { title, component };
  }
}

export default Ember.Component.extend({
  ajax: Ember.inject.service(),

  lineNumbers: true,
  lineWrapping: false,
  mode: 'javascript',
  keyMap: 'default',
  readOnly: false,
  smartIndent: true,
  tabSize: 4,
  theme: 'solarized',

  source: '',
  showMessage: false,

  errors: [],

  setHoverable() {
    Ember.run.schedule('afterRender', () => {
      Ember.$('.collapsible-header').addClass('hoverable');
    });
  },

  click(e) {
    if (isEmpty(Ember.$('.CodeMirror').find($(e.target)))) {
      let errors = get(this, 'errors');
      errors.forEach((error) => {
        set(error, 'forceHover', false);
      });

      set(this, 'errors', errors);
    }
  },

  processReturnResult(response) {
    let { result: result, errorMessage: errorMessage, stdout: stdout, stderr: stderr } = this.get('ajax').processOutcome(response);
    if (this.get('ajax').noCompileErrors(errorMessage)) {
      set(this, 'showMessage', false);
      set(this, 'showNoCompilerErrorsMessage', true);
    } else {
      set(this, 'result', result);
      set(this, 'errorMessage', errorMessage);
      set(this, 'stdout', stdout);
      set(this, 'stderr', stderr);
      set(this, 'showMessage', true);

      this.setHoverable();

      let errors = this.getErrors();
      this.get('ajax').setLastNumberOfErrors(errors.length);
      set(this, 'errors', errors);
      set(this, 'errorLines', errors.mapBy('line'));
    }
  },

  firstError: computed('errors.[]', function() {
    let errors = get(this, 'errors');
    return isPresent(errors) ? errors[0] : null;
  }),

  determineType(errorTitle) {
    let errorTypeObject = ERROR_REGEX.find((errorType) => {
      return errorTitle.match(get(errorType, 'regex'));
    });

    return errorTypeObject ? get(errorTypeObject, 'type') : OTHER;
  },

  generateErrorObject(errorString) {
    let numRegex = /.:([0-9]*):./g;
    let myRegex = /error:+([\s\S]*?)(?=\n)/g;
    let lineNumber = parseInt(errorString.match(numRegex)[0].split(":")[1]);
    let shortError = errorString.match(myRegex)[0];
    let source = get(this, 'source');

    let type = this.determineType(shortError);
    let getErrorInfo = ERROR_INFO[camelize(type)];
    let { title: title, component: component } = getErrorInfo(shortError, source, lineNumber);

    let forceHoverErrorLines = get(this, 'forceHoverErrorLines');
    return {
      line: lineNumber,
      component: component,
      entireError: errorString,
      title: title,
      forceHover: false
    };
  },

  getErrors(){
    let errorMessage = get(this, 'errorMessage');
    if (isPresent(errorMessage)) {
      var entireRegex = /main.c:([0-9]*?):([0-9]*?): error:+([\s\S]*?)(\^)/g;
      let errorsArray = errorMessage.match(entireRegex) || [];
      let errors = errorsArray.map((errorString) => {
        return this.generateErrorObject(errorString);
      });

      return errors;
    } else {
      return [];
    }
  },

  actions: {
    highlightError(errorLines) {
      let errors = get(this, 'errors');
      errors.forEach((error) => {
        set(error, 'forceHover', errorLines.includes(error.line));
      });

      set(this, 'errors', errors);
    },

    highlightCodeLine(lineNumber) {
      set(this, 'highlightLine', lineNumber);
      set(this, 'hoveringOnError', true);
    },

    removeHighlightCodeLine() {
      set(this, 'highlightLine', null);
      set(this, 'hoveringOnError', false);
    },

    sendRequest() {
      let source = get(this, 'source');
      let language = get(this, 'language');
      let filename = get(this, 'filename');
      set(this, 'showMessage', false);

      return this.get('ajax').compilerRequest(source)
      .then((response) => {
        this.processReturnResult(response);
      }).catch((error) => {
        this.handleError(error);
      });
    }
  }
});
