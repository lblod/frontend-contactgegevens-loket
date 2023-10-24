import Route from '@ember/routing/route';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { NamedNode, Namespace } from 'rdflib';

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  'http://ember-submission-form-fields/source-node',
);

async function loadTextFromPublic(url) {
  const response = await fetch(url);
  return await response.text();
}

const FORM = new Namespace('http://lblod.data.gift/vocabularies/forms/');
const RDF = new Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

export default class AndreoRoute extends Route {
  async model() {
    const [formTtl, metaTtl, dataTtl] = await Promise.all([
      loadTextFromPublic('/forms/test-form/form.ttl'),
      loadTextFromPublic('/forms/test-form/meta.ttl'),
      loadTextFromPublic('/forms/test-form/data.ttl'),
    ]);
    const formStore = new ForkingStore();
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(dataTtl, FORM_GRAPHS.sourceGraph, 'text/turtle');

    const form = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph,
    );

    return {
      formStore,
      form,
      title: 'Andreo test form',
      graphs: FORM_GRAPHS,
      sourceNode: SOURCE_NODE,
    };
  }
}
