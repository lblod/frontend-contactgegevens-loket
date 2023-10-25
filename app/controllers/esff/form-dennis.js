import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  importTriplesForForm,
  validateForm,
} from '@lblod/ember-submission-form-fields';

const FIELD_PREDICATE_MAP = {
  attributeA: 'http://mu.semte.ch/vocabularies/ext/inputValueA',
  attributeB: 'http://mu.semte.ch/vocabularies/ext/inputValueB',
};

function copyValuesFromTriplesToObject(triples, targetObject) {
  Object.keys(FIELD_PREDICATE_MAP).forEach((key) => {
    const triple = triples.find(
      (statement) => statement.predicate.value === FIELD_PREDICATE_MAP[key],
    );
    if (!triple)
      throw new Error(`Triple not found for object attribute ${key}!`);
    targetObject[key] = triple.object.value;
  });
}

export default class CoreDataController extends Controller {
  @tracked
  forceShowErrors = false;
  datasetTriples = [];

  @action
  validateForm() {
    const result = validateForm(this.model.form, {
      ...this.model.graphs,
      sourceNode: this.model.sourceNode,
      store: this.model.formStore,
    });
    this.forceShowErrors = !result;
    // Now we console.log the value for testing
    this.datasetTriples = importTriplesForForm(this.model.form, {
      ...this.model.graphs,
      sourceNode: this.model.sourceNode,
      store: this.model.formStore,
    });
    // Oscar magic service will save it

    console.log(this.datasetTriples);
    copyValuesFromTriplesToObject(this.datasetTriples, this.model.dummy);
    console.log(this.model.dummy);
  }
}
