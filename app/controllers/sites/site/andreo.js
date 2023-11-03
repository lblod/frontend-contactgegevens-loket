import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { NamedNode } from 'rdflib';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { inject as service } from '@ember/service';

const formStore = new ForkingStore();
const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

async function saveFormData(adminUnitId, siteId, formData) {
  await fetch(`http://localhost:8888/${adminUnitId}/${siteId}/form/site-form`, {
    method: 'PUT',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export default class AndreoController extends Controller {
  @service currentSession;
  get isLoading() {
    return this.saveTask.isRunning;
  }

  get adminUnitId() {
    return this.model.adminUnitId;
  }

  get siteId() {
    return this.model.siteId;
  }

  saveTask = task({ drop: true }, async (event) => {
    console.log('saveTask triggered');
    event.preventDefault();
    console.log('adminUnitId', this.adminUnitId);
    console.log('siteId:', this.siteId);
    console.log(
      'request URL -> ',
      `http://localhost:8888/${this.adminUnitId}/${this.siteId}/form/site-form`,
    );
    const serializedData = formStore.serializeDataWithAddAndDelGraph(
      FORM_GRAPHS.sourceGraph,
      'application/n-triples',
    );
    await saveFormData(this.adminUnitId, this.siteId, serializedData);
  });
}
