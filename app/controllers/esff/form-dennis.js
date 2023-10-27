import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  importTriplesForForm,
  validateForm,
} from '@lblod/ember-submission-form-fields';
import rdf from 'rdflib';
import {
  RDF,
  FORM,
  SHACL,
  SKOS,
  XSD,
  DCT,
  NIE,
  MU,
} from '@lblod/submission-form-helpers';

const FIELD_PREDICATE_MAP = {
  attributeA: 'http://mu.semte.ch/vocabularies/ext/inputValueA',
  attributeB: 'http://mu.semte.ch/vocabularies/ext/inputValueB',
  pokemon: 'http://mu.semte.ch/vocabularies/ext/pokemonValue',
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

    // Wat we gaan moeten doen:
    const sendToBackend = this.model.formStore.serializeDataMergedGraph(
      this.model.graphs.sourceGraph,
    );
    console.log('We should send to back end', sendToBackend);

    // Now we console.log the value for testing
    this.datasetTriples = importTriplesForForm(this.model.form, {
      ...this.model.graphs,
      sourceNode: this.model.sourceNode,
      store: this.model.formStore,
    });
    // Oscar magic service will save it

    console.log('triples from import function', this.datasetTriples);
    console.log('sourceNode', this.model.sourceNode); // Is this updated?
    console.log('form', this.model.form);
    console.log('Store', this.model.formStore);
    console.log('Graphs', this.model.graphs);
    copyValuesFromTriplesToObject(this.datasetTriples, this.model.dummy);
    console.log(this.model.dummy);

    // Aad Versteden, ForkingStore is dunne wrapper rond RDFlib graph
    // match (subject,predicate,object,graph)
    const statements = this.model.formStore.match(
      rdf.sym(this.model.dummy.pokemon), // this.model.dummy.pokemon contains a string with the URI for the concept
      SKOS('prefLabel'),
      undefined,
      this.model.graphs.metaGraph,
    );
    if (statements.length !== 1)
      throw new Error('The universe is not what I thought it was...');
    console.log('The selected pokemon is:', statements[0].object.value);
  }
}
