import Ember from 'ember';

let { get, set, computed, isPresent } = Ember;

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

  setHoverable() {
    Ember.run.schedule('afterRender', () => {
      Ember.$('.collapsible-header').addClass('hoverable');
    });
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
  },

  errorLines: computed('errors.[]', 'errors.@each.line', function() {
    let errors = get(this, 'errors');
    debugger;
    return errors.mapBy('line');
  }),

  errors: computed('errorMessage', function() {
    let errorMessage = get(this, 'errorMessage');
    if (isPresent(errorMessage)) {
      var entireRegex = /main.c:([0-9]*?):([0-9]*?): error:+([\s\S]*?)(\^)/g;
      let numRegex = /.:([0-9]*):./g;
      let myRegex = /error:+([\s\S]*?)(?=\n)/g;
      let errorsArray = errorMessage.match(entireRegex);
      let errors = errorsArray.map((errorString) => {
        let lineNumber = errorString.match(numRegex)[0].split(":")[1];
        let title = errorString.match(myRegex);
        return { line: parseInt(lineNumber), message: errorString, title: title};
      });

      return errors;
    } else {
      return [];
    }
  }),

  actions: {
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
