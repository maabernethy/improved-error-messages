import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

const { get, set, isPresent } = Ember;

export default AjaxService.extend({
  contentType: 'application/json; charset=utf-8',
  language: 'c',
  filename: 'main.c',
  lastNumberOfErrors: 0,

  setLastNumberOfErrors(number) {
    set(this, 'lastNumberOfErrors', number);
  },

  lessNumberOfErrors(errorMessage) {
    let entireRegex = /main.c:([0-9]*?):([0-9]*?): error:+([\s\S]*?)(\^)/g;
    let errors = errorMessage.match(entireRegex) || [];
    return errors.length < get(this, 'lastNumberOfErrors');
  },

  noCompileErrors(errorMessage) {
    let regex = /_start/g;
    return isPresent(errorMessage.match(regex));
  },

  compilerRequest(source) {
    return this.request('http://52.89.42.128/jobe/index.php/restapi/runs', {
      method: 'POST',
      data: {
        run_spec: {
          sourcecode: source,
          language_id: get(this, 'language'),
          sourcefilename: get(this, 'filename')
        }
      }
    });
  },

  processOutcome(response) {
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

    return { result, errorMessage, stdout, stderr };
  }
});
