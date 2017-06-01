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
    let title = 'control reaches end of non-void function';
    let component = 'return-type-error';
    return { title, component };
  },

  undeclared(shortError) {
    let title = "'small' undeclared (first use in this function)";
    let component = 'undeclared-error';
    return { title, component };
  },

  endOfInput(shortError) {
    let title = 'expected declaration or statement at end of input';
    let component = 'end-of-input-error';
    return { title, component };
  },

  expected(shortError) {
    let title = "expected expression before '=' token";
    let component = 'expected-error';
    return { title, component };
  },

  werror(shortError) {
    let title = "return type defaults to 'int'";
    let component = 'werror-error';
    return { title, component };
  },

  expectedSemicolon(shortError) {
    let title = "expected ';' before '}’ token";
    let component = 'expected-semicolon-error';
    return { title, component };
  },

  expectedIdentifier(shortError) {
    let title = "expected identifier or '(' before ‘return'";
    let component = 'expected-identifier-error';
    return { title, component };
  },

  alreadyDeclared(shortError) {
    let title = "note: previous definition of 'array' was here";
    let component = 'already-declared-error';
    return { title, component };
  },

  other(shortError) {
    let title = shortError;
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
  language: 'c',
  filename: 'main.c',
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
    let result = '';
    let errorMessage = '';
    let stdout = '';
    let stderr = '';
    let outcome = get(response, 'outcome');

    if (outcome === 15) {
      result = "SUCCESS";
      stdout = get(response, 'stdout');
    } else if (outcome === 11) {
      result = "COMPILE_ERROR";
      errorMessage = get(response, 'cmpinfo');
    } else if (outcome === 12) {
      result = "RUNTIME_ERROR";
      stderr = get(response, 'stderr');
    } else if (outcome === 13) {
      result = "RUNTIME_ERROR";
      stderr = "Your submission took too long to execute.";
    } else if (outcome === 17) {
      result = "RUNTIME_ERROR";
      stderr = get(response, 'stderr');
    } else if (outcome === 19) {
      result = "RUNTIME_ERROR";
      stderr = get(response, 'stderr');
    } else {
      result = "RUNTIME_ERROR";
      stderr = "Unfortunately the compilation engine is not working properly at the moment. Please contact an administrator.";
    }

    set(this, 'result', result);
    set(this, 'errorMessage', errorMessage);
    set(this, 'stdout', stdout);
    set(this, 'stderr', stderr);
    set(this, 'showMessage', true);

    this.setHoverable();

    let errors = this.getErrors();
    set(this, 'errors', errors);
    set(this, 'errorLines', errors.mapBy('line'));
  },

  determineType(errorTitle) {
    let errorTypeObject = ERROR_REGEX.find((errorType) => {
      return errorTitle.match(get(errorType, 'regex'));
    });

    return get(errorTypeObject, 'type') || OTHER;
  },

  generateErrorObject(errorString) {
    let numRegex = /.:([0-9]*):./g;
    let myRegex = /error:+([\s\S]*?)(?=\n)/g;
    let lineNumber = parseInt(errorString.match(numRegex)[0].split(":")[1]);
    let shortError = errorString.match(myRegex)[0];

    let type = this.determineType(shortError);
    let getErrorInfo = ERROR_INFO[camelize(type)];
    let { title: title, component: component } = getErrorInfo(shortError);

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
      let errorsArray = errorMessage.match(entireRegex);
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
      debugger;
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

      return this.get('ajax').request('http://52.89.42.128/jobe/index.php/restapi/runs', {
        method: 'POST',
        data: {
          run_spec: {
            sourcecode: source,
            language_id: language,
            sourcefilename: filename
          }
        }
      }).then((response) => {
        this.processReturnResult(response);
      }).catch((error) => {
        this.handleError(error);
      });
    }
  }
});
