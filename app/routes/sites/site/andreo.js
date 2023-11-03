import Route from '@ember/routing/route';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { task } from 'ember-concurrency';
import { NamedNode, Namespace } from 'rdflib';
import { inject as service } from '@ember/service';

export default class AndreoRoute extends Route {
  @service currentSession;

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  async model() {
    const adminUnitId = this.currentSession.group.id;
    const siteId = this.paramsFor('sites.site');
    console.log(siteId);
    console.log(
      'request URL -> ',
      `http://localhost:8888/${adminUnitId}/${siteId}/form/site-form`,
    );
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

    saveTask = task(async (event) => {
      event.preventDefault();
      const serializedData = formStore.serializeDataWithAddAndDelGraph(
        FORM_GRAPHS.sourceGraph,
        'application/n-triples',
      );
      await saveFormData(adminUnitId, siteId, serializedData);
    });

    return {
      formStore,
      form,
      title: 'Andreo test form',
      graphs: FORM_GRAPHS,
      sourceNode: SOURCE_NODE,
    };
  }
}

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  'http://ember-submission-form-fields/source-node',
);

const FORM = new Namespace('http://lblod.data.gift/vocabularies/forms/');
const RDF = new Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

async function saveFormData(serviceId, formId, formData) {
  await fetch(`/lpdc-management/${serviceId}/form/${formId}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

async function loadTextFromPublic(url) {
  const response = await fetch(url);
  return await response.text();
}
