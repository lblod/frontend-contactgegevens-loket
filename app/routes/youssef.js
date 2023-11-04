import Route from '@ember/routing/route';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { Namespace, NamedNode } from 'rdflib';
import { inject as service } from '@ember/service';
export default class YoussefRoute extends Route {
  @service currentSession;

  async model() {
    const siteId = this.paramsFor('sites.site');
    const [formTtl, metaTtl, dataTtl] = await Promise.all([
      this.fetchForm('/forms/test-form/form.ttl'),
      this.fetchFormMeta('/forms/test-form/meta.ttl'),
      this.fetchFormData('/forms/test-form/data.ttl'),
    ]);
    const adminUnitId = this.currentSession.group.id;
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
      title: 'Youssef Form',
      graphs: FORM_GRAPHS,
      sourceNode: SOURCE_NODE,
      adminUnitId,
      siteId,
    };
  }

  async fetchForm() {
    let response = await fetch(getFormDataPath('form.ttl'));
    let ttl = await response.text();

    return ttl;
  }

  async fetchFormMeta() {
    let response = await fetch(getFormDataPath('meta.ttl'));
    if (response.status >= 200 && response.status < 300) {
      return await response.text();
    }
    return '';
  }

  async fetchFormData() {
    let response = await fetch(getFormDataPath('data.ttl'));
    if (response.status >= 200 && response.status < 300) {
      return await response.text();
    }
    return '';
  }
}

export const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  'http://ember-submission-form-fields/source-node',
);

const FORM = new Namespace('http://lblod.data.gift/vocabularies/forms/');
const RDF = new Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

export function getFormDataPath(fileName) {
  return `/test-forms/${fileName}`;
}
