import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { validateForm } from '@lblod/ember-submission-form-fields';
import { FORM, FORM_GRAPHS, SOURCE_NODE } from '../routes/youssef';
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
  @tracked forceShowErrors = false;
  saveTask = task(async (siteId, adminUnitId, formData) => {
    await this.model.site.save();
    // let serializedData = this.formStore.serializeDataWithAddAndDelGraph(
    //   FORM_GRAPHS.sourceGraph,
    //   'application/n-triples',
    // );
    // console.log('Serialized Data', this.formStore);
    await this.saveFormData(siteId, adminUnitId, formData);
  });
  // Define the saveFormData function
  async saveFormData(adminUnitId, siteId, formData) {
    console.log(`/semantic-forms/${siteId}/form/site-form`);
    let isValidForm = validateForm(this.model.form, {
      ...FORM_GRAPHS,
      sourceNode: SOURCE_NODE,
      store: this.formStore,
    });
    this.forceShowErrors = !isValidForm;
    if (isValidForm) {
      const response = await fetch(
        `/semantic-forms/${this.model.site.id}/form/site-form`,
        {
          method: 'PUT',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('This is validated');
      return response;
    } else {
      console.log('Not validated');
    }
  }
}
