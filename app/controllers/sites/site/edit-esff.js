import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

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

  get form() {
    return this.model.form;
  }

  get sourceNode() {
    return this.model.sourceNode;
  }

  get formStore() {
    return this.model.formStore;
  }

  get graphs() {
    return this.model.graphs;
  }

  saveTask = task({ drop: true }, async (event) => {
    event.preventDefault();
    console.log('saveTask running');
    console.log('adminUnitId', this.adminUnitId);
    console.log('siteId:', this.siteId);
    console.log(
      'request URL -> ',
      `/semantic-forms/${this.adminUnitId}/${this.siteId}/form/site-form`,
    );
    const serializedData = this.formStore.serializeDataWithAddAndDelGraph(
      this.graphs.sourceGraph,
      'application/n-triples',
    );
    await saveFormData(this.adminUnitId, this.siteId, serializedData);
  });
}

async function saveFormData(adminUnitId, siteId, formData) {
  await fetch(`/semantic-forms/${adminUnitId}/${siteId}/form/site-form`, {
    method: 'PUT',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json;',
    },
  });
}
