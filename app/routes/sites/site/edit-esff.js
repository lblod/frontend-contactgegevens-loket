import Route from '@ember/routing/route';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { NamedNode, Namespace } from 'rdflib';
import { inject as service } from '@ember/service';
export default class AndreoRoute extends Route {
  @service currentSession;
  async model() {
    const adminUnitId = this.currentSession.group.id;
    const siteId = this.paramsFor('sites.site').id;
    const FORM_GRAPHS = {
      formGraph: new NamedNode('http://data.lblod.info/form'),
      metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
      sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
    };
    const SOURCE_NODE = new NamedNode(
      `http://data.lblod.info/id/vestigingen/${siteId}`,
    );
    const FORM = new Namespace('http://lblod.data.gift/vocabularies/forms/');
    const RDF = new Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    const response = await fetch(
      `/semantic-forms/${adminUnitId}/${siteId}/form/site-form`,
    );
    const json = await response.json();
    const { form: formTtl, meta: metaTtl, source: dataTtl } = json;
    const formStore = new ForkingStore();
    console.log(formTtl);
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    console.log(metaTtl);
    //formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    console.log(dataTtl);
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
      adminUnitId,
      siteId,
    };
  }
}

async function loadTextFromPublic(url) {
  const response = await fetch(url);
  return await response.text();
}
