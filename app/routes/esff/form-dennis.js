import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { NamedNode, Namespace } from 'rdflib';
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
import DummyObject from '../../models/dummy';

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

export default class EsffFormDennisRoute extends Route {
  async model() {
    const [formTtl, metaTtl, dataTtl] = await Promise.all([
      loadTextFromPublic('/forms/dennis-test-form/form.ttl'),
      loadTextFromPublic('/forms/dennis-test-form/meta.ttl'),
      loadTextFromPublic('/forms/dennis-test-form/data.ttl'),
    ]);
    const formStore = new ForkingStore(); // triple store in memory
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(dataTtl, FORM_GRAPHS.sourceGraph, 'text/turtle');

    const form = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph,
    );

    const dummy = new DummyObject();

    return {
      formStore,
      form,
      title: 'Dennis test form',
      graphs: FORM_GRAPHS,
      sourceNode: SOURCE_NODE, // 'data'
      dummy,
    };
  }
}
