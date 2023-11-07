import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { validateForm } from '@lblod/ember-submission-form-fields';
import { tracked } from '@glimmer/tracking';

export default class YoussefController extends Controller {
  get site() {
    return this.model.site;
  }
  get adminUnitId() {
    return this.model.adminUnitId;
  }
  get formData() {
    return this.model.formData;
  }
  get formStore() {
    return this.model.formStore;
  }
  get graphs() {
    return this.model.graphs;
  }
  get sourceNode() {
    return this.model.sourceNode;
  }
  get form() {
    return this.model.form;
  }
  @tracked forceShowErrors = false;
  saveTask = task(async (event) => {
    event.preventDefault();
    await this.model.site.save();
    const serializedData = this.formStore.serializeDataWithAddAndDelGraph(
      this.graphs.sourceGraph,
      'application/n-triples',
    );
    await this.saveFormData(this.adminUnitId, this.site.id, serializedData);
  });
  // Define the saveFormData function
  async saveFormData(adminUnitId, siteId, formData) {
    console.log(`/semantic-forms/${adminUnitId}/${siteId}/form/site-form`);
    let isValidForm = validateForm(this.model.form, {
      ...this.graphs,
      sourceNode: this.sourceNode,
      store: this.formStore,
    });
    this.forceShowErrors = !isValidForm;
    if (isValidForm) {
      const response = await fetch(
        `/semantic-forms/${adminUnitId}/${siteId}/form/site-form`,
        {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('This is validated');
      return response;
    }
  }
}
